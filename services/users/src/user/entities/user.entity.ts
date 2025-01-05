import { user } from "@prisma/client";
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity implements user {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  document: string;

  @ApiProperty()
  pin: number;

  @ApiProperty()
  document_type_id: number;

  @ApiProperty({ required: false, nullable: true })
  email: string | null;

  @ApiProperty()
  password: string;

  @ApiProperty({ default: false })
  active: boolean;

  @ApiProperty({ default: true })
  pending: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  created_by: string;
}