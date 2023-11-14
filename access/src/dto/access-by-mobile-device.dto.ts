import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class AccessByMobileDeviceDto {
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    qrcode: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    encoded: string
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    mac: string

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userId: string
}