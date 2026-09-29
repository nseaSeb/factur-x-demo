import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HateoasService } from '../common/hateoas/hateoas.service';
import { ComputeTotalsDto } from './dto/compute-totals.dto';
import { ConformanceResultDto } from './dto/conformance-result.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { GeneratePdfQueryDto } from './dto/generate-pdf-query.dto';
import {
  InvoiceCollectionResourceDto,
  InvoiceDto,
  InvoiceResourceDto,
} from './dto/invoice-resource.dto';
import { ListInvoicesQueryDto } from './dto/list-invoices-query.dto';
import { ParseInvoiceResponseDto } from './dto/parse-invoice-response.dto';
import { TotalsResultDto } from './dto/totals-result.dto';
import { ValidationResultDto } from './dto/validation-result.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly hateoas: HateoasService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an invoice record' })
  @ApiResponse({ status: 201, type: InvoiceResourceDto })
  async create(@Body() dto: CreateInvoiceDto): Promise<InvoiceResourceDto> {
    const invoice = await this.invoicesService.create(dto);
    return this.toResource(invoice);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices' })
  @ApiResponse({ status: 200, type: InvoiceCollectionResourceDto })
  async findAll(
    @Query() query: ListInvoicesQueryDto,
  ): Promise<InvoiceCollectionResourceDto> {
    const [invoices, total] = await this.invoicesService.findAll(
      query.page,
      query.limit,
      query.number,
    );
    return {
      data: invoices.map((invoice) => this.toInvoiceDto(invoice)),
      _links: this.hateoas.collectionLinks(
        '/invoices',
        query.page,
        query.limit,
        total,
        query.number ? { number: query.number } : undefined,
      ),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single invoice' })
  @ApiResponse({ status: 200, type: InvoiceResourceDto })
  async findOne(@Param('id') id: string): Promise<InvoiceResourceDto> {
    const invoice = await this.invoicesService.findOne(id);
    return this.toResource(invoice);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate the Factur-X PDF for a stored invoice' })
  async generatePdf(
    @Param('id') id: string,
    @Query() query: GeneratePdfQueryDto,
  ): Promise<StreamableFile> {
    const pdfBytes = await this.invoicesService.generatePdf(id, query.profile);
    return new StreamableFile(pdfBytes, {
      type: 'application/pdf',
      disposition: 'attachment; filename="factur-x.pdf"',
    });
  }

  @Get(':id/conformance')
  @ApiOperation({
    summary:
      'Check the invoice XML against the official XSD and Schematron of a profile',
  })
  @ApiResponse({ status: 200, type: ConformanceResultDto })
  async conformance(
    @Param('id') id: string,
    @Query() query: GeneratePdfQueryDto,
  ): Promise<ConformanceResultDto> {
    return this.invoicesService.checkConformance(id, query.profile);
  }

  @Post('totals')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Derive line amounts, VAT breakdown and document totals (computeTotals)',
  })
  @ApiResponse({ status: 200, type: TotalsResultDto })
  async computeTotals(@Body() dto: ComputeTotalsDto): Promise<TotalsResultDto> {
    return this.invoicesService.computeTotals(dto);
  }

  @Post('parse')
  @ApiOperation({
    summary: 'Upload a Factur-X PDF and persist the extracted invoice',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, type: ParseInvoiceResponseDto })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async parse(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ParseInvoiceResponseDto> {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    const { entity, metadata } = await this.invoicesService.parseAndPersist(
      file.buffer,
    );
    const resource = this.toResource(entity);
    return { ...resource, parsedMetadata: metadata };
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Run EN 16931 validation without persisting anything',
  })
  @ApiResponse({ status: 200, type: ValidationResultDto })
  async validate(@Body() dto: CreateInvoiceDto): Promise<ValidationResultDto> {
    return this.invoicesService.validateAdHoc(dto);
  }

  private toInvoiceDto(invoice: Invoice): InvoiceDto {
    return invoice;
  }

  private toResource(invoice: Invoice): InvoiceResourceDto {
    return {
      data: this.toInvoiceDto(invoice),
      _links: this.hateoas.invoiceLinks(invoice.id),
    };
  }
}
