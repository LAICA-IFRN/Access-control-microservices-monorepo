import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateRfidDto {
  
  @ApiProperty()
  @IsString()
  tag: string;
  
  @ApiProperty()
  @IsString()
  userId: string;
}
