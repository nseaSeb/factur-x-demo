import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacturxService } from '../facturx/facturx.service';
import { InvoiceRendererService } from '../facturx/invoice-renderer.service';
import { Invoice } from './entities/invoice.entity';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let findAndCount: jest.Mock;
  let findOne: jest.Mock;
  let facturx: Record<string, jest.Mock>;
  let env: Record<string, string>;

  beforeEach(async () => {
    findAndCount = jest.fn().mockResolvedValue([[], 0]);
    findOne = jest.fn();
    env = {};
    facturx = {
      generateInvoice: jest.fn(),
      parseInvoice: jest.fn(),
      validate: jest.fn(),
      extractGenerateValidationErrors: jest.fn(),
      isParseError: jest.fn(),
      computeTotals: jest.fn(),
      serialize: jest.fn().mockResolvedValue('<xml/>'),
      validateXsd: jest.fn().mockResolvedValue({ valid: true, errors: [] }),
      validateSchematron: jest.fn(),
      isSerializeError: jest.fn().mockResolvedValue(false),
      isSaxonError: jest.fn().mockResolvedValue(false),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount,
            findOne,
          },
        },
        {
          provide: InvoiceRendererService,
          useValue: { render: jest.fn() },
        },
        { provide: FacturxService, useValue: facturx },
        {
          provide: ConfigService,
          useValue: { get: (key: string) => env[key] },
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('does not filter when no number is given', async () => {
      await service.findAll(2, 10);

      expect(findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
        skip: 10,
        take: 10,
      });
    });

    it('filters on the exact invoice number', async () => {
      await service.findAll(1, 20, 'DEMO-2026-001');

      expect(findAndCount).toHaveBeenCalledWith({
        where: { number: 'DEMO-2026-001' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('computeTotals', () => {
    it('hands the draft to the lib without the demo-only profile field', async () => {
      facturx.computeTotals.mockResolvedValue({ ok: true, invoice: {} });

      await service.computeTotals({
        number: 'X',
        profile: 'BASIC',
        lines: [],
      } as never);

      expect(facturx.computeTotals).toHaveBeenCalledWith({
        number: 'X',
        lines: [],
      });
    });
  });

  describe('checkConformance', () => {
    beforeEach(() => {
      findOne.mockResolvedValue({
        id: 'id',
        profile: 'EN 16931',
        payload: { issueDate: '2026-09-26T00:00:00.000Z', lines: [] },
      });
    });

    it('runs the XSD of the requested profile and skips Schematron without Saxon', async () => {
      const result = await service.checkConformance('id', 'BASIC');

      expect(facturx.serialize).toHaveBeenCalledWith(
        expect.objectContaining({ issueDate: expect.any(Date) as Date }),
        'BASIC',
      );
      expect(facturx.validateXsd).toHaveBeenCalledWith('<xml/>', 'BASIC');
      expect(facturx.validateSchematron).not.toHaveBeenCalled();
      expect(result.schematron.status).toBe('skipped');
    });

    it('points Schematron at the code-list DB of the profile', async () => {
      env.FACTURX_SAXON_URL = 'http://saxon/transform';
      env.FACTURX_SAXON_CODEDB_DIR = 'file:///opt/facturx/';
      facturx.validateSchematron.mockResolvedValue({
        valid: true,
        errors: [],
        warnings: [],
      });

      const result = await service.checkConformance('id', 'BASIC WL');

      expect(facturx.validateSchematron).toHaveBeenCalledWith('<xml/>', {
        profile: 'BASIC WL',
        endpoint: 'http://saxon/transform',
        codedbUrl: 'file:///opt/facturx/FACTUR-X_BASIC-WL_codedb.xml',
      });
      expect(result.schematron).toEqual({
        status: 'checked',
        valid: true,
        errors: [],
        warnings: [],
      });
    });

    it('reports a Saxon outage as unavailable, never as a pass', async () => {
      env.FACTURX_SAXON_URL = 'http://saxon/transform';
      facturx.validateSchematron.mockRejectedValue(new Error('ECONNREFUSED'));
      facturx.isSaxonError.mockResolvedValue(true);

      const result = await service.checkConformance('id');

      expect(result.profile).toBe('EN 16931');
      expect(result.schematron).toEqual({
        status: 'unavailable',
        reason: 'ECONNREFUSED',
      });
    });
  });
});
