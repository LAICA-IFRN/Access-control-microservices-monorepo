import { 
  ArrayNotEmpty, 
  IsArray, 
  IsBase64, 
  IsEmail, 
  IsIn, 
  IsMACAddress, 
  IsNumberString, 
  IsOptional, 
  IsString, 
  IsUUID,
  Length
} from "class-validator"
import { ApiProperty } from '@nestjs/swagger';
import { IsCPFOrCNPJ } from "src/decorators/cpf-or-cnpj.decorator";

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false})
  name?: string

  @IsNumberString()
  @Length(7, 14)
  @IsOptional()
  @ApiProperty({ required: false})
  registration?: string

  @IsOptional()
  @IsCPFOrCNPJ()
  @IsOptional()
  @ApiProperty({ required: false})
  document: string

  documentType: 'CPF' | 'CNPJ' | 'Registration'

  @IsBase64()
  encodedImage: string

  @IsEmail()
  @IsOptional()
  @ApiProperty({ required: false })
  email?: string

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false})
  password?: string

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(['ADMIN', 'FREQUENTER', 'ENVIRONMENT_MANAGER'], { each: true })
  @ApiProperty()
  roles: string[]
  
  @IsOptional()
  @ApiProperty({ required: false })
  tag?: string
  // TODO: adcionar validação de RFID no padrão "xxxxxxxx" ou "xx xx xx xx", onde cada "x" é um hexadecimal
  
  @IsOptional()
  @IsMACAddress()
  @ApiProperty({ required: false })
  mac?: string
}
