import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"

export class AccessByMobileDeviceDto {
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    token: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    encoded?: string

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userId: string
}