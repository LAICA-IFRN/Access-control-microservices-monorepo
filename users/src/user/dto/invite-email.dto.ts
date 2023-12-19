import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsEmail, IsIn, IsOptional, IsString, IsUUID } from "class-validator";

export class InviteEmail {
  @IsEmail()
  email: string;

  @IsString()
  path: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(
    ['ADMIN', 'FREQUENTER', 'ENVIRONMENT_MANAGER'],
    { each: true }
  )
  @ApiProperty({ isArray: true })
  rolesToAdd: string[];

  @IsUUID()
  @IsOptional()
  invitedBy?: string;
}