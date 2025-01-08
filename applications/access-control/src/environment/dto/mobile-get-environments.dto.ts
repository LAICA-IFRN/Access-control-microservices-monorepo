import { IsArray, IsUUID } from "class-validator";

export class MobileGetEnvironmentsDto {
  @IsUUID()
  userId: string;

  @IsArray()
  roleKeys: number[];
}