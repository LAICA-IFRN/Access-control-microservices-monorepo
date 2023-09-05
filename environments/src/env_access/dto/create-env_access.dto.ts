import { ArrayNotEmpty, IsArray, IsIn, IsUUID } from "class-validator";
import { IsTimeFormat } from "../decorators/is-time-format.decorator";
import { IsDateFormat } from "../decorators/is-date-format.decorator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateEnvAccessDto {
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn([0, 1, 2, 3, 4, 5, 6], { each: true })
  days: number[];
  
  @ApiProperty()
  @IsTimeFormat()
  startTime: string;

  @ApiProperty()
  @IsTimeFormat()
  endTime: string;

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
  @IsUUID()
  environmentId: string;
}

