import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class EnvManagerStatusDto {
  @IsBoolean()
  @ApiProperty()
  status: boolean;
}
