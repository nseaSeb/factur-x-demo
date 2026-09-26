import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  FacturXInvoice,
  FacturXMetadata,
  ValidationResult,
} from 'factur-x-ts';
import type { FacturXProfile } from '../facturx/facturx-profile';
import { FacturxService } from '../facturx/facturx.service';
import { InvoiceRendererService } from '../facturx/invoice-renderer.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { fromFacturXInvoice, toFacturXInvoice } from './invoice.mapper';

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

  private dtoToFacturXInvoice(dto: CreateInvoiceDto): FacturXInvoice {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping `profile`, which isn't part of FacturXInvoice
    const { profile, ...invoice } = dto;
    return invoice;
  }
}
