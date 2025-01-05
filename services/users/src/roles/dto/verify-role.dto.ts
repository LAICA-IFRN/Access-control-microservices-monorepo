import { ArrayNotEmpty, IsArray, IsIn, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class VerifyRoleDto {
  @IsUUID()
  @ApiProperty()
  userId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(
    ['ADMIN', 'FREQUENTER', 'ENVIRONMENT_MANAGER'],
    { each: true }
  )
  @ApiProperty({ isArray: true })
  roles: string[];
}