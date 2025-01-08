import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateRfidDto {
  
  @ApiProperty()
  @IsString()
  tag: string;
  
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  createdBy?: string;
}
