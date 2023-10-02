import { IsOptional } from 'class-validator';
import { IsDateFormat } from '../decorators/is-date-format.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { AccessDto } from './access.dto';

export class UpdateEnvAccessDto {
  
  @IsOptional()
  @ApiProperty()
  accessesToRemove: string[];

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
