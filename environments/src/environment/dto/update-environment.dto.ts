import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEnvironmentDto {
  @IsString()
  @ApiProperty()
  @IsOptional()
  name: string

  @IsString()
  @ApiProperty()
  @IsOptional()
  description: string
}
