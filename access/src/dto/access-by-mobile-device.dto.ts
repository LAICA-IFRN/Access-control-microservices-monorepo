import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class AccessByMobileDeviceDto {
    
    @ApiProperty()
    @IsString()
    qrcode: string

    @ApiProperty()
    @IsString()
    encoded: string
    
    @ApiProperty()
    @IsString()
    mac: string
}