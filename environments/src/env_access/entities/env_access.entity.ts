import { ApiProperty } from "@nestjs/swagger";
import { EnvAccess } from "@prisma/client";

export class EnvAccessEntity implements EnvAccess {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  day: number;
  
  @ApiProperty()
  startTime: Date;
  
  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  startPeriod: Date;

  @ApiProperty()
  endPeriod: Date;
  
  @ApiProperty()
  userId: string;
  
  @ApiProperty()
  environmentId: string;
  
  @ApiProperty({ default: true })
  active: boolean;
  
  @ApiProperty({ default: new Date()})
  createdAt: Date;
  
  @ApiProperty({ default: new Date()})
  updatedAt: Date;
}

