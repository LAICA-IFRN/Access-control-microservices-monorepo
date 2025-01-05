import { ApiProperty } from "@nestjs/swagger";
import { IsJWT } from "class-validator";

export class AuthorizationMobileDto {
  @ApiProperty()
  @IsJWT()
  token: string;
}