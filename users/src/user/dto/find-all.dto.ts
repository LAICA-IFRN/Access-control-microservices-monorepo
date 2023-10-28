import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumber, IsObject, IsOptional } from "class-validator";

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
  @IsOptional()
  @ApiProperty()
  where?: any;

  @IsOptional()
  @ApiProperty()
  orderBy?: any;
}
