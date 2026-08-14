import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  field: string;

  @ApiProperty()
  message: string;
}

export class ValidationResultDto {
  @ApiProperty()
  valid: boolean;

  @ApiProperty({ type: [ValidationErrorDto] })
  errors: readonly ValidationErrorDto[];
}
