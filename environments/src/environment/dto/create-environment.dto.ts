import { IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnvironmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string

  @IsString()
  @ApiProperty()
  @IsOptional()
  description?: string

  @IsLatitude()
  @ApiProperty()
  latitude: number

  @IsLongitude()
  @ApiProperty()
  longitude: number

  @IsUUID()
  @ApiProperty()
  createdBy: string
}
