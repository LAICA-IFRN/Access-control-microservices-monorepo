import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateEnvManagerDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  userName: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  environmentId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  createdBy: string;
}
