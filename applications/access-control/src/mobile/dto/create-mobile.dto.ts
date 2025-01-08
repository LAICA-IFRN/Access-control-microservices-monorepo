import { IsString } from "class-validator";

export class CreateMobileDto {
    @IsString()
    mac: string;
    @IsString()
    number: string;
}
