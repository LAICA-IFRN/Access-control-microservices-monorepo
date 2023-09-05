// fazer classes de resposta para o swagger dos endpoints de env_access.controller.ts
// Path: environments/src/env_access/entities/swagger-env-access.entity.ts
// use como base: environments/src/env/entities/swagger-env.entity.ts
import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger";

export class CreateBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
    "day must be one of the following values: 0, 1, 2, 3, 4, 5, 6",
    "startTime must be a valid time in the format HH:MM:SS",
    "endTime must be a valid time in the format HH:MM:SS",
    "startPeriod must be a valid date in the format YYYY/MM/DD",
    "endPeriod must be a valid date in the format YYYY/MM/DD",
    "property ${invalid_property_name} should not exist",
    "startTime must be less than endTime",
    "startPeriod must be less than endPeriod",
  ]})
  message: string
}

export class CreateConflictResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Foreign key constraint failed on the field: ${field_name}",
    "Already exists: ${target}",
    "days: ${days} - time: ${startTime} at ${endTime} - period: ${startPeriod} at ${endPeriod}"
  ]})
  message: string
}

export class CreateNotFoundResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Environment not found",
    "User not found",
  ]})
  message: string
}

export class CreateForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "User is not a frequenter",
    "Can't create environment access"
  ]})
  message: string
}

export class FindParityResponseEntity {
  @ApiProperty()
  days: number[]

  @ApiProperty()
  startTime: Date

  @ApiProperty()
  endTime: Date
}

export class InvalidIdBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
  ]})
  message: string
}

export class FindOneForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Can't find environment access",
  ]})
  message: string
}

export class EnvAccessNotFoundResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Environment access not found",
  ]})
  message: string
}

export class UpdateStatusBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
    "status must be a boolean value",
  ]})
  message: string
}

export class UpdateForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Can't update environment access",
  ]})
  message: string
}

export class UpdateNotFoundResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Environment not found",
    "Environment access not found",
  ]})
  message: string
}

export class UpdateStatusSuccessResponseEntity {
  @ApiProperty()
  active: boolean
}

export class UpdateBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
    "day must be one of the following values: 0, 1, 2, 3, 4, 5, 6",
    "startTime must be a valid time in the format HH:MM:SS",
    "endTime must be a valid time in the format HH:MM:SS",
    "startPeriod must be a valid date in the format YYYY/MM/DD",
    "endPeriod must be a valid date in the format YYYY/MM/DD",
    "property ${invalid_property_name} should not exist",
    "startTime must be less than endTime",
    "startPeriod must be less than endPeriod",
  ]})
  message: string
}

export class VerifyAccessResponseEntity {
  @ApiProperty()
  envAccess: boolean
}
