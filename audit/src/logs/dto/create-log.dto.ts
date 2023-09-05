import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsString } from "class-validator";

export class CreateLogDto {
  
  @ApiProperty()
  @IsString()
  type: string;
  
  @ApiProperty()
  @IsString()
  message: string;
  
  @ApiProperty()
  @IsString()
  topic: string;

  @ApiProperty({ type: JSON })
  @IsObject()
  meta: object;
}
