import { ArrayNotEmpty, IsArray, IsIn, IsOptional } from 'class-validator';
import { IsTimeFormat } from '../decorators/is-time-format.decorator';
import { IsDateFormat } from '../decorators/is-date-format.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEnvAccessDto {
  
  @IsOptional()
  @IsIn([0, 1, 2, 3, 4, 5, 6])
  @ApiProperty()
  day: number;
  
  @IsOptional()
  @IsTimeFormat()
  @ApiProperty()
  startTime: string;
  
  @IsOptional()
  @IsTimeFormat()
  @ApiProperty()
  endTime: string;

  @IsOptional()
  @IsDateFormat()
  @ApiProperty()
  startPeriod: string;

  @IsOptional()
  @IsDateFormat()
  @ApiProperty()
  endPeriod: string;
}
