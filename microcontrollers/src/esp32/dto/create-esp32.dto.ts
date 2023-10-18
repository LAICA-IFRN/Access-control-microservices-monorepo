import { ApiProperty } from "@nestjs/swagger";
import { IsIP, IsMACAddress, IsOptional, IsUUID } from "class-validator";

export class CreateEsp32Dto {
  
  @ApiProperty()
  @IsMACAddress()
  mac: string;

  @ApiProperty()
  @IsIP()
  ip: string

  @ApiProperty()
  @IsUUID()
  environmentId: string;
}
