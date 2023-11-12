import { ApiProperty } from "@nestjs/swagger"
import { IsIP, IsMACAddress, IsOptional, IsString } from "class-validator"

export class AccessByMicrocontrollerDeviceDto {
    
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
}