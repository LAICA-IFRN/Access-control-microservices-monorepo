import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsCPFOrCNPJ } from 'src/decorators/cpf-or-cnpj.decorator';

export class UpdateUserDataDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false})
  name?: string

  @IsOptional()
  @IsCPFOrCNPJ()
  @IsOptional()
  @ApiProperty({ required: false})
  document?: string

  @IsEmail()
  @IsOptional()
  @ApiProperty({ required: false})
  email?: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ required: false})
  password?: string
}
