import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsIn, IsJWT } from "class-validator";

export class AuthorizationDto {
  @ApiProperty()
  @IsJWT()
  token: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(
    ['ADMIN', 'FREQUENTER', 'ENVIRONMENT_MANAGER'],
    { each: true }
  )
  @ApiProperty({ isArray: true })
  roles: string[];
}