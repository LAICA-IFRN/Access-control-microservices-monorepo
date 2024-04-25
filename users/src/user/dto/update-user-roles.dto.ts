import { ArrayNotEmpty, IsArray, IsIn, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(['ADMIN', 'FREQUENTER', 'ENVIRONMENT_MANAGER'], { each: true })
  @ApiProperty()
  rolesToAdd?: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(['FREQUENTER', 'ENVIRONMENT_MANAGER'], { each: true })
  @ApiProperty()
  rolesToRemove?: string[];

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  requestUserId?: string
}
