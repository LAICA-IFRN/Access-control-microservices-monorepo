import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateEnvironmentDto {
  @IsString()
  @ApiProperty()
  @IsOptional()
  name: string

  @IsString()
  @ApiProperty()
  @IsOptional()
  description: string

  @IsUUID()
  @ApiProperty()
  @IsOptional()
  requestUserId?: string
}
