import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class EnvAccessStatusDto {
  @IsBoolean()
  @ApiProperty()
  status: boolean;

  @IsUUID()
  @ApiProperty()
  @IsOptional()
  requestUserId?: string
}
