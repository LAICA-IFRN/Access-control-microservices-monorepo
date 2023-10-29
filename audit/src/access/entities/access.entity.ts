import { ApiProperty } from "@nestjs/swagger";
import { access } from "@prisma/client";

export class AccessEntity implements access {
  @ApiProperty()
  id: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  type: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  environment_id: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  access_by: string;
}
