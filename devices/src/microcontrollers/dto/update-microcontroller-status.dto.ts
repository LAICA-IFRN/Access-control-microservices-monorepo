import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateMicrocontrollerStatusDto {
  @IsBoolean()
  @ApiProperty()
  status: boolean;
}
