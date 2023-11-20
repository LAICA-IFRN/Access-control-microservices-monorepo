import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsUUID } from "class-validator";

export class TokenizeAccessDto {

  @ApiProperty()
  @IsString()
  qrcode: string;

  @ApiProperty()
  @IsNumber()
  microcontrollerId: number;

  @ApiProperty()
  @IsUUID()
  userId: string;
}