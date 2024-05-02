import { ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsOptional, IsString, IsUUID } from "class-validator";
import { IsDateFormat } from "../decorators/is-date-format.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { AccessDto } from "./access.dto";

export class CreateEnvAccessDto {
  @ApiProperty()
  @IsDateFormat()
  @IsOptional()
  startPeriod?: string;

  @ApiProperty()
  @IsDateFormat()
  @IsOptional()
  endPeriod?: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsUUID()
  environmentId: string;

  @ApiProperty()
  @IsUUID()
  requestUserId: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  permanent?: boolean;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  access?: AccessDto[];
}

