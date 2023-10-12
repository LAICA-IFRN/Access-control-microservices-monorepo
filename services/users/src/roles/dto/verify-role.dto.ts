import { IsIn, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class VerifyRoleDto {
  @IsUUID()
  @ApiProperty()
  userId: string;

  @IsIn(['ADMIN', 'FREQUENTER', 'ENVIRONMENT_MANAGER'])
  @ApiProperty()
  role: string;
}