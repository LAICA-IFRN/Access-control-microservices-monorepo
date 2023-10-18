import { ApiProperty } from "@nestjs/swagger";
import { microcontroller } from "@prisma/client";

export class Esp32Entity implements microcontroller {
  
  @ApiProperty()  
  id: string;
  
  @ApiProperty()  
  mac: string;
  
  @ApiProperty()  
  ip: string;
  
  @ApiProperty()  
  environmentId: string;

  @ApiProperty()
  microcontroller_type_id: number;
  
  @ApiProperty()  
  active: boolean;
  
  @ApiProperty()  
  createdAt: Date;
  
  @ApiProperty()
  updatedAt: Date;
}
