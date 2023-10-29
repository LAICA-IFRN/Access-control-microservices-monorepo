import { ApiProperty } from "@nestjs/swagger";
import { log } from "@prisma/client";

export class LogEntity implements log {
  @ApiProperty()
  id: number;
  
  @ApiProperty({ default: new Date() })
  created_at: Date;
  
  @ApiProperty()
  type: string;
  
  @ApiProperty()
  topic: string;
  
  @ApiProperty()
  message: string;
  
  @ApiProperty({ type: JSON })
  meta: string;
}
