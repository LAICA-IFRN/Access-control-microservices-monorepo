import { ApiProperty } from "@nestjs/swagger";
import { IsIP, IsMACAddress, IsOptional } from "class-validator";

export class UpdateMicrocontrollerDto {
  @ApiProperty()
  @IsMACAddress()
  @IsOptional()
  mac: string;

  @ApiProperty()
  @IsIP()
  @IsOptional()
  ip: string
}
