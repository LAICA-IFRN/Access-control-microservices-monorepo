import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class FindAccessDto {
  @IsUUID()
  @ApiProperty()
  userId: string;

  @IsUUID()
  @ApiProperty()
  environmentId: string;
}