import { ApiProperty } from "@nestjs/swagger";
import { IsIP, IsMACAddress, IsOptional, IsString } from "class-validator";

export class UpdateMicrocontrollerDto {
  @ApiProperty()
  @IsMACAddress()
  @IsOptional()
  mac: string;

  @ApiProperty()
  @IsIP()
  @IsOptional()
  ip: string

  @ApiProperty()
  @IsString()
  type: string
}
