import { ApiProperty } from "@nestjs/swagger";
import { Access, EnvAccess } from "@prisma/client";

type access = { day: number, startTime: string, endTime: string, active: boolean };

export class EnvAccessEntity implements EnvAccess {
  @ApiProperty()
  id: string;

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

  @ApiProperty()
  accesses: Access[];
  
  @ApiProperty({ default: new Date()})
  createdAt: Date;
  
  @ApiProperty({ default: new Date()})
  updatedAt: Date;
}

