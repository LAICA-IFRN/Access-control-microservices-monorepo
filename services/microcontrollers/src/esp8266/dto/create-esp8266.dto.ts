import { ApiProperty } from "@nestjs/swagger";
import { IsIP, IsMACAddress, IsNumber, IsUUID } from "class-validator";

export class CreateEsp8266Dto {

  @ApiProperty()
  @IsMACAddress()
  mac: string;

  @ApiProperty()
  @IsIP()
  ip: string;

  @ApiProperty()
  @IsUUID()
  environmentId: string;

  @ApiProperty()
  @IsNumber()
  esp32Id?: number;
}
