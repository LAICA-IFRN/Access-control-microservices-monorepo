import { IsBoolean } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class UserStatusDto {
  @IsBoolean()
  @ApiProperty()
  status: boolean
}