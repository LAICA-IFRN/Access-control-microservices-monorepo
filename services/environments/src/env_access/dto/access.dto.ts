import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsIn } from "class-validator";
import { IsTimeFormat } from "../decorators/is-time-format.decorator";

export class AccessDto {
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
}