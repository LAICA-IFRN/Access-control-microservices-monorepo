import { ApiProperty } from "@nestjs/swagger";
import { IsMACAddress, IsString } from "class-validator";

export class TokenizeMobileDto {

  @ApiProperty()
  @IsString()
  document: string;

  @ApiProperty()
  @IsString()
  password: string;

  // @ApiProperty()
  // @IsMACAddress()
  // mac: string;
}