import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacturxService } from '../facturx/facturx.service';
import { Invoice } from './entities/invoice.entity';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
          },
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
});
