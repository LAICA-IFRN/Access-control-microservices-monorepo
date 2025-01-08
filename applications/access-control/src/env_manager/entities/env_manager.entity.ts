import { ApiProperty } from "@nestjs/swagger";
import { environment_manager } from "@prisma/client";

export class EnvManagerEntity implements environment_manager {
  
  @ApiProperty()  
  id: string;
  
  @ApiProperty()  
  active: boolean;
  
  @ApiProperty()  
  user_id: string;

  @ApiProperty()
  user_name: string;
  
  @ApiProperty()  
  environment_id: string;
  
  @ApiProperty()
  created_by: string;
  
  @ApiProperty()  
  created_at: Date;
  
  @ApiProperty()
  updated_at: Date;
}
