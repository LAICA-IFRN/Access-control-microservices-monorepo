import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger";

export class IdParamInvalidResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: 'Invalid id entry'})
  message: string
}

export class CreateBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "ip must be an IP address",
    "mac must be a MAC Address",
    "environmentId must be a UUID",
    "esp32Id must be a number",
    "property ${target} should not exist"
  ]})
  message: string
}

export class CreateConflictResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: 'Already exists: ${target}'})
  message: string
}

export class CreateNotFoundResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: 'Record not found: ${target}'})
  message: string
}

export class CreateForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: "Can't create esp8266 record"})
  message: string
}

export class FindAllBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "skip must be a number conforming to the specified constraints",
    "take must be a number conforming to the specified constraints",
    "Invalid skip or take"
  ]})
  message: string
}

export class FindAllNotFoundResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: 'Environment not found'})
  message: string
}

export class FindAllForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: "Can't find esp8266 records"})
  message: string
}

export class FindOneNotFoundResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: 'Esp8266 not found'})
  message: string
}

export class UpdateBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "ip must be an IP address",
    "mac must be a MAC Address",
    "environmentId must be a UUID",
    "property ${target} should not exist"
  ]})
  message: string
}

export class UpdateConflictResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: 'Already exists: ${target}'})
  message: string
}

export class UpdateForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: "Can't update esp8266 record"})
  message: string
}

export class UpdateStatusBadRequesteEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "status must be a boolean",
    "Invalid id entry"
  ]})
  status: boolean
}

export class UpdateStatusForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: "Can't change esp8266 status"})
  message: string
}

export class RemoveForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Esp8266 is being used",
    "Can't remove esp8266 record"
  ]})
  message: string
}
