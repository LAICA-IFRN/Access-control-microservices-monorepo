import { ApiProperty } from "@nestjs/swagger";
import { environment_user_access_control, environment_user } from "@prisma/client";

type access = { day: number, startTime: string, endTime: string, active: boolean };

export class EnvAccessEntity implements environment_user {
  @ApiProperty()
  id: string;

  @ApiProperty()
  start_period: Date;

  @ApiProperty()
  end_period: Date;
  
  @ApiProperty()
  user_id: string;
  
  @ApiProperty()
  environment_id: string;
  
  @ApiProperty({ default: true })
  active: boolean;

  @ApiProperty()
  accesses: access[];

  @ApiProperty()
  created_by: string;
  
  @ApiProperty({ default: new Date()})
  created_at: Date;
  
  @ApiProperty({ default: new Date()})
  updated_at: Date;
}

