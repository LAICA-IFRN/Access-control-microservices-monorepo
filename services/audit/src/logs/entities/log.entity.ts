import { ApiProperty } from "@nestjs/swagger";
import { Log } from "@prisma/client";

export class LogEntity implements Log {
  
  @ApiProperty()
  id: number;
  
  @ApiProperty({ default: new Date() })
  createdAt: Date;
  
  @ApiProperty()
  type: string;
  
  @ApiProperty()
  topic: string;
  
  @ApiProperty()
  message: string;
  
  @ApiProperty({ type: JSON })
  meta: string;
}
