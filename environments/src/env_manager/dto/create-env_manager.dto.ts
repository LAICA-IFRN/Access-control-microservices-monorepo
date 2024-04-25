import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

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

  @IsOptional()
  @IsUUID()
  @ApiProperty()
  requestUserId?: string;
}
