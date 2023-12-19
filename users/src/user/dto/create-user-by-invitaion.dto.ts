import { IsBase64, IsNumber, IsString, IsUUID } from "class-validator"
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserByInvitationDto {
  @ApiProperty()
  @IsNumber()
  pin: number

  @ApiProperty()
  @IsString()
  password: string

  @IsBase64()
  @ApiProperty()
  encodedUserImage: string

  @ApiProperty()
  @IsUUID()
  userId: string

  @ApiProperty()
  @IsString()
  token: string
}
