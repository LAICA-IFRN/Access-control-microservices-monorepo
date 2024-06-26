import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator"

export class AccessByMobileDeviceDto {

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    environmentId: string
    
    // @ApiProperty()
    // @IsString()
    // @IsNotEmpty()
    // token: string

    // @ApiProperty()
    // @IsString()
    // @IsOptional()
    // encoded?: string

    // @ApiProperty()
    // @IsBoolean()
    // @IsOptional()
    // fingerprint?: boolean

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userId: string

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    mobileId: string
}