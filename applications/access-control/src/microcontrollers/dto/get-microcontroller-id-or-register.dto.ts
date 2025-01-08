import { ApiProperty } from "@nestjs/swagger";
import { IsIP, IsMACAddress, IsUUID } from "class-validator";

export class MicrocontrollerIdOrRegisterDto {

  @ApiProperty()
  @IsMACAddress()
  mac: string;

  @ApiProperty()
  @IsIP()
  ip: string

  @ApiProperty()
  @IsUUID()
  environmentId: string
}
