import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsNumberString, IsOptional, IsString } from "class-validator"

export class FindToAccess {
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false})
    document?: string

    @IsNumberString()
    @IsOptional()
    @ApiProperty({ required: false})
    pin?: any
}