import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class ValidateToToken {
    @ApiProperty()
    @IsString()
    document: string

    @ApiProperty()
    @IsString()
    password: string
}