import { IsEmail, IsOptional, IsString, IsUUID } from "class-validator";

export class InviteEmail {
  @IsEmail()
  email: string;

  @IsString()
  path: string;

  @IsUUID()
  @IsOptional()
  invitedBy?: string;
}