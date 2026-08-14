import { Module } from '@nestjs/common';
import { HateoasService } from './hateoas.service';

@Module({
  providers: [HateoasService],
  exports: [HateoasService],
})
export class HateoasModule {}
