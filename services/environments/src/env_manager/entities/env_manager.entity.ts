import { ApiProperty } from "@nestjs/swagger";
import { EnvManager } from "@prisma/client";

export class EnvManagerEntity implements EnvManager {
  
  @ApiProperty()  
  id: string;
  
  @ApiProperty()  
  active: boolean;
  
  @ApiProperty()  
  userId: string;
  
  @ApiProperty()  
  environmentId: string;
  
  @ApiProperty()  
  createdAt: Date;
  
  @ApiProperty()
  updatedAt: Date;
}
