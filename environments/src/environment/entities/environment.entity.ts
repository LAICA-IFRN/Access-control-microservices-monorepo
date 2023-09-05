import { ApiProperty } from "@nestjs/swagger";
import { Environment } from "@prisma/client";

export class EnvironmentEntity implements Environment {
  
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  name: string;
  
  @ApiProperty({ required: false })
  description: string;
  
  @ApiProperty({ default: true })
  active: boolean;
  
  @ApiProperty()
  adminId: string;
  
  @ApiProperty({ default: new Date() })
  createdAt: Date;
  
  @ApiProperty({ default: new Date() })
  updatedAt: Date;
}
