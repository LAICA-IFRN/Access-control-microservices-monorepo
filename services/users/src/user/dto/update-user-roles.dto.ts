import { ArrayNotEmpty, IsArray, IsIn } from 'class-validator';
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
}
