import { IsIn, IsOptional } from 'class-validator';
import { IsTimeFormat } from '../decorators/is-time-format.decorator';
import { IsDateFormat } from '../decorators/is-date-format.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { AccessDto } from './access.dto';

export class UpdateEnvAccessDto {
  
  @IsOptional()
  @ApiProperty()
  accessesToRemove: AccessDto[];

  @IsOptional()
  @ApiProperty()
  accessesToAdd: AccessDto[];

  @IsOptional()
  @IsDateFormat()
  @ApiProperty()
  startPeriod: string;

  @IsOptional()
  @IsDateFormat()
  @ApiProperty()
  endPeriod: string;
}
