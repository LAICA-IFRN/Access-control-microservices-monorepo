import { Document, User } from "@prisma/client";
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity implements User {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  document: Document;

  @ApiProperty({ required: false, nullable: true })
  email: string | null;

  @ApiProperty()
  password: string;

  @ApiProperty({ default: true })
  active: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}