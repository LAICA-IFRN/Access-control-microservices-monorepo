import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class CreateRfidDto {
  
  @ApiProperty()
  @IsString()
  tag: string;
  
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  createdBy: string;
}
