import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HateoasService } from '../common/hateoas/hateoas.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import {
  ProductCollectionResourceDto,
  ProductDto,
  ProductResourceDto,
} from './dto/product-resource.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly hateoas: HateoasService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a product to the catalog' })
  @ApiResponse({ status: 201, type: ProductResourceDto })
  async create(@Body() dto: CreateProductDto): Promise<ProductResourceDto> {
    const product = await this.productsService.create(dto);
    return this.toResource(product);
  }

  @Get()
  @ApiOperation({ summary: 'List catalog products' })
  @ApiResponse({ status: 200, type: ProductCollectionResourceDto })
  async findAll(
    @Query() query: ListProductsQueryDto,
  ): Promise<ProductCollectionResourceDto> {
    const [products, total] = await this.productsService.findAll(
      query.page,
      query.limit,
    );
    return {
      data: products.map((product) => this.toProductDto(product)),
      _links: this.hateoas.collectionLinks(
        '/products',
        query.page,
        query.limit,
        total,
      ),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product' })
  @ApiResponse({ status: 200, type: ProductResourceDto })
  async findOne(@Param('id') id: string): Promise<ProductResourceDto> {
    const product = await this.productsService.findOne(id);
    return this.toResource(product);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, type: ProductResourceDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResourceDto> {
    const product = await this.productsService.update(id, dto);
    return this.toResource(product);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a product from the catalog' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productsService.remove(id);
  }

  private toProductDto(product: Product): ProductDto {
    return product;
  }

  private toResource(product: Product): ProductResourceDto {
    return {
      data: this.toProductDto(product),
      _links: this.hateoas.productLinks(product.id),
    };
  }
}
