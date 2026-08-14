import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HateoasModule } from '../common/hateoas/hateoas.module';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), HateoasModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
