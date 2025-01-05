import { IsBoolean, IsOptional, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class UserStatusDto {
  @IsBoolean()
  @ApiProperty()
  status: boolean

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  requestUserId?: string
}