import { IsBoolean } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class EnvStatusDto {
  @IsBoolean()
  @ApiProperty()
  status: boolean
}