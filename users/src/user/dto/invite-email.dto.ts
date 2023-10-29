import { IsEmail, IsString } from "class-validator";

export class InviteEmail {
  @IsEmail()
  email: string;

  @IsString()
  path: string;
}