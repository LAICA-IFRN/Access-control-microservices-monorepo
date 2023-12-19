import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class FindToAccess {
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false})
    document?: string

    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false})
    pin?: number
}