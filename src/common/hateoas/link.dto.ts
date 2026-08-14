import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LinkDto {
  @ApiProperty()
  href: string;

  @ApiPropertyOptional({ enum: ['GET', 'POST', 'PATCH', 'DELETE'] })
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
}
