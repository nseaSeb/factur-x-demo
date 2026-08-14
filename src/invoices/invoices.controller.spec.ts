import { Test, TestingModule } from '@nestjs/testing';
import { HateoasService } from '../common/hateoas/hateoas.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

describe('InvoicesController', () => {
  let controller: InvoicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        {
          provide: InvoicesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            generatePdf: jest.fn(),
            parseAndPersist: jest.fn(),
            validateAdHoc: jest.fn(),
          },
        },
        {
          provide: HateoasService,
          useValue: { invoiceLinks: jest.fn(), collectionLinks: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<InvoicesController>(InvoicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
