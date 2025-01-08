import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger";

export class CreateBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
    "property name must be a string",
    "property name should not be empty",
    "property adminId must be a UUID",
    "property adminId should not be empty",
    "property description must be a string",
  ]})
  message: string
}

export class CreateNotFoundResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "User not found",
    'Admin not found: ${target}',
  ]})
  message: string
}

export class CreateForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Can't create environment",
    "User is not a admin"
  ]})
  message: string
}

export class ConflictResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: 'Already exists: ${field}'})
  message: string
}

// criar classe de resposta para cada endpoint de environment.controller.ts
export class FindAllBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "property skip must be a number conforming to the specified constraints",
    "property take must be a number conforming to the specified constraints",
  ]})
  message: string
}

export class FindOneBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
  ]})
  message: string
}

export class UpdateBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
    "property name must be a string",
    "property name should not be empty",
    "property description must be a string",
  ]})
  message: string
}

export class UpdateStatusBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
    "property status must be a boolean value",
  ]})
  message: string
}

export class UpdateStatusForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Can't change environment status",
  ]})
  message: string
}

export class UpdateStatusSuccessResponseEntity {
  @ApiProperty()
  active: boolean
}

export class RemoveBadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Invalid id entry",
  ]})
  message: string
}

export class RemoveForbiddenResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Can't delete environment",
  ]})
  message: string
}

export class EnvironmentNotFoundResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "Environment not found",
  ]})
  message: string
}
