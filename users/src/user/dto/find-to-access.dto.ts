import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class FindToAccess {
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false})
    document?: string

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false})
    pin?: string
}