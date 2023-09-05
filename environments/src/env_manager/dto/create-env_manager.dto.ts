import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateEnvManagerDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  environmentId: string;
}
