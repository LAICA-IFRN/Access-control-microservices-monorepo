import { ApiProperty } from "@nestjs/swagger";
import { UserRoles } from "@prisma/client";

export class RoleEntity implements UserRoles {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  roleId: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;
}
