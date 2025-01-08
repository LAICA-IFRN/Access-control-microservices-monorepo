import { ApiProperty } from "@nestjs/swagger";
import { IsIP, IsMACAddress, IsString } from "class-validator";

export class CreateMicrocontrollerDto {
  
  @ApiProperty()
  @IsMACAddress()
  mac: string;

  @ApiProperty()
  @IsIP()
  ip: string

  @ApiProperty()
  @IsString()
  type: string
}
