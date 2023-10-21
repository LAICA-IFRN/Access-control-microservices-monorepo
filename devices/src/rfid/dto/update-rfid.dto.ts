import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateRfidDto {
  
  @ApiProperty()
  @IsString()
  tag: string;
}
