import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateStatusRfidDto {
  
  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsNumber()
  tagId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  updatedBy?: string;
}
