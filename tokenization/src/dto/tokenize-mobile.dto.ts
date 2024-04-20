import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class TokenizeMobileDto {

  @ApiProperty()
  @IsString()
  document: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsOptional()
  mobileId?: string;
}