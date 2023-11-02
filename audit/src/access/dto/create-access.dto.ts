import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsObject, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateAccessDto {
  @ApiProperty()
  //@IsIn(['info', 'error', 'warning'])
  @IsString()
  type: string;
  
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ type: JSON })
  @IsObject()
  @IsOptional()
  meta?: object;
}
