import { ApiProperty } from "@nestjs/swagger";
import { TagRFID } from "@prisma/client";

export class RfidEntity implements TagRFID {
  
  @ApiProperty()
  id: number;
  
  @ApiProperty()
  tag: string;
  
  @ApiProperty()
  userId: string;
  
  @ApiProperty()
  active: boolean;
  
  @ApiProperty()
  createdAt: Date;
  
  @ApiProperty()
  updatedAt: Date;
}
