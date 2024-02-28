import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmptyObject, IsNumber, IsObject, IsOptional } from "class-validator";

export class FindAllDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  previous?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  next?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  pageSize?: number;

  @IsObject()
  @IsNotEmptyObject()
  @ApiProperty()
  @IsOptional()
  where?: any;

  @ApiProperty()
  @IsNotEmptyObject()
  @IsOptional()
  orderBy?: any;

  @ApiProperty()
  @IsNotEmptyObject()
  @IsOptional()
  select?: any;
}
