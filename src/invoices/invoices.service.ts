import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  FacturXInvoice,
  FacturXMetadata,
  TotalsResult,
  ValidationResult,
} from 'factur-x-ts';
import type { FacturXProfile } from '../facturx/facturx-profile';
import { FacturxService } from '../facturx/facturx.service';
import { InvoiceRendererService } from '../facturx/invoice-renderer.service';
import { ComputeTotalsDto } from './dto/compute-totals.dto';
import type {
  ConformanceResultDto,
  SchematronReportDto,
} from './dto/conformance-result.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { fromFacturXInvoice, toFacturXInvoice } from './invoice.mapper';

// File names of the code-list DBs baked into factur-x-ts's Saxon image
// (docker/Dockerfile in the lib repo), per profile.
const CODEDB_FILES: Record<FacturXProfile, string> = {
  MINIMUM: 'FACTUR-X_MINIMUM_codedb.xml',
  'BASIC WL': 'FACTUR-X_BASIC-WL_codedb.xml',
  BASIC: 'FACTUR-X_BASIC_codedb.xml',
  'EN 16931': 'FACTUR-X_EN16931_codedb.xml',
  EXTENDED: 'FACTUR-X_EXTENDED_codedb.xml',
};

export interface ParsedInvoiceResult {
  entity: Invoice;
  metadata: FacturXMetadata;
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private readonly repository: Repository<Invoice>,
    private readonly facturx: FacturxService,
    private readonly renderer: InvoiceRendererService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.dtoToFacturXInvoice(dto);
    const entity = this.repository.create({
      number: invoice.number,
      profile: dto.profile ?? 'EN 16931',
      source: 'created',
      payload: fromFacturXInvoice(invoice),
    });
    return this.repository.save(entity);
  }

  async findAll(
    page: number,
    limit: number,
    number?: string,
  ): Promise<[Invoice[], number]> {
    return this.repository.findAndCount({
      where: number ? { number } : {},
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.repository.findOne({ where: { id } });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }
    return invoice;
  }

  async generatePdf(
    id: string,
    profileOverride?: FacturXProfile,
  ): Promise<Uint8Array> {
    const entity = await this.findOne(id);
    const invoice = toFacturXInvoice(entity.payload);
    const profile = profileOverride ?? entity.profile;
    const visualPdf = this.renderer.render(entity.payload, profile);
    try {
      return await this.facturx.generateInvoice({
        invoice,
        profile,
        visualPdf,
      });
    } catch (error) {
      const validationErrors =
        await this.facturx.extractGenerateValidationErrors(error);
      if (validationErrors) {
        throw new BadRequestException({
          message: 'Factur-X generation failed EN 16931 validation',
          validationErrors,
        });
      }
      throw error;
    }
  }

  async parseAndPersist(buffer: Uint8Array): Promise<ParsedInvoiceResult> {
    let result;
    try {
      result = await this.facturx.parseInvoice(buffer);
    } catch (error) {
      if (await this.facturx.isParseError(error)) {
        throw new BadRequestException((error as Error).message);
      }
      throw error;
    }
    const entity = this.repository.create({
      number: result.invoice.number,
      profile: result.metadata.conformanceLevel,
      source: 'parsed',
      payload: fromFacturXInvoice(result.invoice),
    });
    return {
      entity: await this.repository.save(entity),
      metadata: result.metadata,
    };
  }

  async validateAdHoc(dto: CreateInvoiceDto): Promise<ValidationResult> {
    const invoice = this.dtoToFacturXInvoice(dto);
    return this.facturx.validate(invoice);
  }

  async computeTotals(dto: ComputeTotalsDto): Promise<TotalsResult> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping `profile`, which isn't part of DraftInvoice
    const { profile, ...draft } = dto;
    return this.facturx.computeTotals(draft);
  }

  /**
   * Runs the official rule sets on the CII XML this invoice serializes to:
   * the bundled XSD (in-process, xmllint-wasm) and, when a Saxon server is
   * configured, the Schematron business rules. A Saxon outage is reported
   * as `unavailable`, never as a clean pass.
   */
  async checkConformance(
    id: string,
    profileOverride?: FacturXProfile,
  ): Promise<ConformanceResultDto> {
    const entity = await this.findOne(id);
    const profile = profileOverride ?? entity.profile;
    let xml: string;
    try {
      xml = await this.facturx.serialize(
        toFacturXInvoice(entity.payload),
        profile,
      );
    } catch (error) {
      if (await this.facturx.isSerializeError(error)) {
        throw new BadRequestException((error as Error).message);
      }
      throw error;
    }

    const xsd = await this.facturx.validateXsd(xml, profile);
    return {
      profile,
      xsd: {
        valid: xsd.valid,
        errors: xsd.errors.map((e) => ({
          message: e.message,
          line: e.location?.lineNumber,
        })),
      },
      schematron: await this.runSchematron(xml, profile),
    };
  }

  private async runSchematron(
    xml: string,
    profile: FacturXProfile,
  ): Promise<SchematronReportDto> {
    const endpoint = this.config.get<string>('FACTURX_SAXON_URL');
    if (!endpoint) {
      return {
        status: 'skipped',
        reason: 'FACTURX_SAXON_URL non configurée',
      };
    }
    // Without codedbUrl the XSLT fetches the code lists from GitHub; the
    // lib's Saxon image bakes them in, so point it at the local copy.
    const codedbDir = this.config.get<string>('FACTURX_SAXON_CODEDB_DIR');
    try {
      const result = await this.facturx.validateSchematron(xml, {
        profile,
        endpoint,
        codedbUrl: codedbDir
          ? `${codedbDir.replace(/\/$/, '')}/${CODEDB_FILES[profile]}`
          : undefined,
      });
      return {
        status: 'checked',
        valid: result.valid,
        errors: [...result.errors],
        warnings: [...result.warnings],
      };
    } catch (error) {
      if (await this.facturx.isSaxonError(error)) {
        return { status: 'unavailable', reason: (error as Error).message };
      }
      throw error;
    }
  }

  private dtoToFacturXInvoice(dto: CreateInvoiceDto): FacturXInvoice {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping `profile`, which isn't part of FacturXInvoice
    const { profile, ...invoice } = dto;
    return invoice;
  }
}
