import { IsBoolean, IsOptional, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RoleStatusDto {
  @ApiProperty()
  @IsBoolean()
  status: boolean

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  requestUserId?: string
}