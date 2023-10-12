import { ApiProperty } from "@nestjs/swagger";
import { IsMACAddress } from "class-validator";

export class FindOneByMacDto {
    @ApiProperty()
    @IsMACAddress()
    mac: string
}