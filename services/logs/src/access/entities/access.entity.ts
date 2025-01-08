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
  message: string;

  @ApiProperty()
  meta: string;
}
