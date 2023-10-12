import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class EnvAccessStatusDto {
  @IsBoolean()
  @ApiProperty()
  status: boolean;
}
