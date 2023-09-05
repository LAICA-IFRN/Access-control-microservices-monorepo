import { IsBoolean } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RoleStatusDto {
  @IsBoolean()
  @ApiProperty()
  status: boolean
}