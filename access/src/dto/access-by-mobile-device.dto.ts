import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsUUID } from "class-validator"

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

    @ApiProperty()
    @IsUUID()
    userId: string
}