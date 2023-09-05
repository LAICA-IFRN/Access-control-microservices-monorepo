import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger";

export class CreateBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "mac must be a MAC Address",
    "ip must be a IP Address",
    "environmentId must be a UUID",
  ]})
  message: string
}

export class FindAllBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid skip or take"
  ]})
  message: string
}

export class UnauthorizedResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({ example: [
    'Unauthorized user access', 
    'Unauthorized'
  ]})
  message: string
}
