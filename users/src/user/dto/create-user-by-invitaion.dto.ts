import { IsBase64, IsString } from "class-validator"
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserByInvitationDto {
  @ApiProperty()
  @IsString()
  registration: string

  @ApiProperty()
  @IsString()
  password: string

  @IsBase64()
  @ApiProperty()
  encodedUserImage: string
}
