import { ApiProperty } from "@nestjs/swagger";
import { tag_rfid } from "@prisma/client";

export class RfidEntity implements tag_rfid {
  
  @ApiProperty()
  id: number;
  
  @ApiProperty()
  tag: string;
  
  @ApiProperty()
  user_id: string;
  
  @ApiProperty()
  active: boolean;

  @ApiProperty()
  created_by: string;
  
  @ApiProperty()
  created_at: Date;
  
  @ApiProperty()
  updated_at: Date;
}
