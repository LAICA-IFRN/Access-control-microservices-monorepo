import { ApiProperty } from "@nestjs/swagger"
import { IsHexadecimal, IsIP, IsMACAddress, IsOptional, IsString } from "class-validator"

export class AccessDto {
    
    @ApiProperty()
    @IsIP()
    ip: string
    
    @ApiProperty()
    @IsMACAddress()
    mac: string
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    user?: string
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    password?: string
    
    @ApiProperty()
    @IsOptional()
    // @IsHexadecimal() // todo: add rfid validation
    rfid?: string
    
    @ApiProperty()
    @IsOptional()
    @IsMACAddress()
    mobile?: string
}