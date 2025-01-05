import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class ValidateToToken {
    @IsString()
    @ApiProperty()
    document?: string

    @IsString()
    @ApiProperty()
    password?: string
}