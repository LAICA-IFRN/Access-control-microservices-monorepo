import { IsBoolean, IsOptional, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class EnvStatusDto {
  @IsBoolean()
  @ApiProperty()
  status: boolean

  @IsUUID()
  @ApiProperty()
  @IsOptional()
  requestUserId?: string
}