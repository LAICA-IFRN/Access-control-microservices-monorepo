import { ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsDateFormat } from "src/env_access/decorators/is-date-format.decorator";
import { AccessDto } from "src/env_access/dto/access.dto";

export class CreateTemporaryAccessDto {
  @ApiProperty()
  @IsDateFormat()
  startPeriod: string;

  @ApiProperty()
  @IsDateFormat()
  endPeriod: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsString()
  userName: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  description?: string

  @ApiProperty()
  @IsUUID()
  environmentId: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  noAccessRestrict?: boolean;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  requestUserId?: string;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  access: AccessDto[];
}