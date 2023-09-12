import { ApiProperty } from "@nestjs/swagger";

export class AccessEntity {
    @ApiProperty()
    access: boolean
}