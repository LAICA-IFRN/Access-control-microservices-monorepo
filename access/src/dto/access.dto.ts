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
    @IsString()
    encoded: string
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    document?: string

    @ApiProperty()
    @IsOptional()
    @IsString()
    pin?: string
    
    @ApiProperty()
    @IsOptional()
    // @IsHexadecimal() // todo: add rfid validation
    rfid?: string
    
    @ApiProperty()
    @IsOptional()
    @IsMACAddress()
    mobile?: string
}