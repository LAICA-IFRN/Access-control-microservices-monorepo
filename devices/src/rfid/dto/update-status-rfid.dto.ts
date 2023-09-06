import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsUUID } from "class-validator";

export class UpdateStatusRfidDto {
  
  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsNumber()
  rfid: number;
}
