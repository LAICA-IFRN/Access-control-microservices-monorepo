import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsIn, IsOptional, IsUUID } from "class-validator";

export class CreateRoleDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(
    ['ADMIN', 'FREQUENTER', 'ENVIRONMENT_MANAGER'],
    { each: true }
  )
  @ApiProperty({ isArray: true })
  rolesToAdd: string[];

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  requestUserId?: string
}
