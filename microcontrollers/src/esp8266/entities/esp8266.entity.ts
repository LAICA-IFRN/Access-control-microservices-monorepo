import { ApiProperty } from "@nestjs/swagger";
import { Esp8266 } from "@prisma/client";

export class Esp8266Entity implements Esp8266 {
  
  @ApiProperty()
  id: number;
  
  @ApiProperty()
  ip: string;
  
  @ApiProperty()
  mac: string;
  
  @ApiProperty()
  environmentId: string;
  
  @ApiProperty()
  active: boolean;
  
  @ApiProperty()
  createdAt: Date;
  
  @ApiProperty()
  updatedAt: Date;
  
  @ApiProperty()
  esp32Id: number;
}
