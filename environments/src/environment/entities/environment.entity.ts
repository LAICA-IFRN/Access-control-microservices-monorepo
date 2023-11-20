import { ApiProperty } from "@nestjs/swagger";
import { environment } from "@prisma/client";

export class EnvironmentEntity implements environment {
  
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  name: string;
  
  @ApiProperty({ required: false })
  description: string;
  
  @ApiProperty({ default: true })
  active: boolean;
  
  @ApiProperty()
  created_by: string;
  
  @ApiProperty({ default: new Date() })
  created_at: Date;
  
  @ApiProperty({ default: new Date() })
  updated_at: Date;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;
}
