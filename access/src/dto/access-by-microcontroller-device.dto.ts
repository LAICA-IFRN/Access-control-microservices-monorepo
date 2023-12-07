import { ApiProperty } from "@nestjs/swagger"
import { IsIP, IsMACAddress, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class AccessByMicrocontrollerDeviceDto {
    
    @ApiProperty()
    @IsIP()
    @IsNotEmpty()
    ip: string
    
    @ApiProperty()
    @IsMACAddress()
    @IsNotEmpty()
    mac: string

    // @ApiProperty()
    // @IsString()
    // @IsNotEmpty()
    // encoded: string
    
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
    @IsString()
    // @IsHexadecimal() // todo: add rfid validation
    rfid?: string
}