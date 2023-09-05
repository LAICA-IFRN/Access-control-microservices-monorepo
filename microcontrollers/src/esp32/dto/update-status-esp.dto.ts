import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateStatusEspDto {
  @IsBoolean()
  @ApiProperty()
  status: boolean;
}
