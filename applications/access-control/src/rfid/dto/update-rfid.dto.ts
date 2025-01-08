import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateRfidDto {
  
  @ApiProperty()
  @IsString()
  tag: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  updatedBy?: string;
}
