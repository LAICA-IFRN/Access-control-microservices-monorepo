// fazer classes de resposta para o swagger dos endpoints de env_manager.controller.ts
// Path: environments/src/env_manager/entities/swagger-env-manager.entity.ts
// use como base: environments/src/env/entities/swagger-env.entity.ts
import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger";

export class CreateBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
    "property userId must be a UUID",
    "property userId should not be empty",
    "property environmentId must be a UUID",
    "property environmentId should not be empty",
  ]})
  message: string
}

export class CreateConflictResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Already exists: ${target}",
    "Foreign key constraint failed on the field: ${field_name}",
  ]})
  message: string
}

export class CreateForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Can't create environment manager",
    "User is not a enviroment manager",
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

export class FindAllBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
    "property skip must be a number conforming to the specified constraints",
    "property take must be a number conforming to the specified constraints",
  ]})
  message: string
}

export class FindOneForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Can't find environment manager",
  ]})
  message: string
}

export class InvalidIdBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
  ]})
  message: string
}

export class UpdateStatusBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid status entry",
    "property status must be a boolean value",
  ]})
  message: string
}

export class UpdateStatusForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Can't update environment manager status",
  ]})
  message: string
}

export class UpdateStatusSuccessResponseEntity {
  @ApiProperty()
  active: boolean
}

export class EnvManagerNotFoundResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Environment manager not found",
  ]})
  message: string
}

export class VerifyManagerResponseEntity {
  @ApiProperty()
  envManager: boolean
}

