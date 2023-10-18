import { ApiProperty } from "@nestjs/swagger";
import { user_role } from "@prisma/client";

export class RoleEntity implements user_role {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role_id: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  created_by: string;

  @ApiProperty()
  created_at: Date;
}
