import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class TokenizeMicrocontrollerDto {

  @ApiProperty()
  @IsString()
  secretHash: string;
}