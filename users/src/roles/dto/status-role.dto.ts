import { IsBoolean } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RoleStatusDto {
  @ApiProperty()
  @IsBoolean()
  status: boolean
}