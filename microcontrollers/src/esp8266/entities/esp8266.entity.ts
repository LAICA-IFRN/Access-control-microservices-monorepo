import { ApiProperty } from "@nestjs/swagger";
import { microcontroller } from "@prisma/client";

export class Esp8266Entity implements microcontroller {
  
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  ip: string;
  
  @ApiProperty()
  mac: string;

  @ApiProperty()
  microcontroller_type_id: number;
  
  @ApiProperty()
  environmentId: string;
  
  @ApiProperty()
  active: boolean;
  
  @ApiProperty()
  createdAt: Date;
  
  @ApiProperty()
  updatedAt: Date;

}
