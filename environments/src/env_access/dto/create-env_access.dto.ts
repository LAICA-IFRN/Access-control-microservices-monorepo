import { ArrayNotEmpty, IsArray, IsIn, IsOptional, IsString, IsUUID } from "class-validator";
import { IsDateFormat } from "../decorators/is-date-format.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { AccessDto } from "./access.dto";

export class CreateEnvAccessDto {
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

  @ApiProperty()
  @IsUUID()
  environmentId: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  requestUserId: string;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  access: AccessDto[];
}

