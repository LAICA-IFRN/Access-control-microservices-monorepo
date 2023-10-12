import { ApiProperty } from "@nestjs/swagger";
import { Esp32 } from "@prisma/client";

export class Esp32Entity implements Esp32 {
  
  @ApiProperty()  
  id: number;
  
  @ApiProperty()  
  mac: string;
  
  @ApiProperty()  
  ip: string;
  
  @ApiProperty()  
  environmentId: string;
  
  @ApiProperty()  
  active: boolean;
  
  @ApiProperty()  
  createdAt: Date;
  
  @ApiProperty()
  updatedAt: Date;
}
