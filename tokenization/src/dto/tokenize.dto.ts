import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class TokenizeDto {
  
  @ApiProperty()
  @IsString()
  document: string;
  
  @ApiProperty()
  @IsString()
  password: string;
}