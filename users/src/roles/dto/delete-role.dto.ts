import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsIn, IsOptional, IsUUID } from "class-validator";

export class DeleteRoleDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(
    ['ADMIN', 'FREQUENTER', 'ENVIRONMENT_MANAGER'],
    { each: true }
  )
  @ApiProperty()
  rolesToDelete: string[];

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  requestUserId?: string
}
