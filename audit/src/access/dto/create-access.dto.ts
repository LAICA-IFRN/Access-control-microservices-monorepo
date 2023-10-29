import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsObject, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateAccessDto {
  @ApiProperty()
  @IsIn(['info', 'error', 'warning'])
  type: string;
  
  @ApiProperty()
  @IsString()
  message: string;
  
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  environment_id?: string;

  @ApiProperty()
  @IsIn(['rfid', 'pin', 'app', 'remote'])
  @IsOptional()
  access_by?: string;

  @ApiProperty({ type: JSON })
  @IsObject()
  @IsOptional()
  meta?: object;
}
