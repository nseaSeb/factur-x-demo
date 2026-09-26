import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacturxService } from '../facturx/facturx.service';
import { InvoiceRendererService } from '../facturx/invoice-renderer.service';
import { Invoice } from './entities/invoice.entity';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let findAndCount: jest.Mock;

  beforeEach(async () => {
    findAndCount = jest.fn().mockResolvedValue([[], 0]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount,
            findOne: jest.fn(),
          },
        },
        {
          provide: InvoiceRendererService,
          useValue: { render: jest.fn() },
        },
        {
          provide: FacturxService,
          useValue: {
            generateInvoice: jest.fn(),
            parseInvoice: jest.fn(),
            validate: jest.fn(),
            extractGenerateValidationErrors: jest.fn(),
            isParseError: jest.fn(),
          },
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
});
