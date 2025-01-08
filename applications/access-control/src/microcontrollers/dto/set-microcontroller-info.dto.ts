import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional } from "class-validator";

export class SetMicrocontrollerInfoDto {
  @ApiProperty()
  @IsNumber()
  id: number;
  
  @ApiProperty()
  @IsNumber()
  healthCode: number;
  
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  doorStatus?: boolean;

}