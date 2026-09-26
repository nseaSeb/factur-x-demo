import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListInvoicesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Exact invoice number filter' })
  @IsOptional()
  @IsString()
  number?: string;
}
