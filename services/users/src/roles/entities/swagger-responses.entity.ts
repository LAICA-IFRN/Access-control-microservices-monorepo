import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger";

export class BadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "each value in roles must be one of the following values: ADMIN, FREQUENTER, ENVIRONMENT_MANAGER",
    "Invalid id entry",
    "Admin user cannot have other roles",
  ]})
  message: string
}

export class RemoveBadREquestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "each value in roles must be one of the following values: ADMIN, FREQUENTER, ENVIRONMENT_MANAGER",
    "Invalid id entry",
    "Cannot remove a role from an admin user",
  ]})
  message: string
}

export class BadRequestVerifyResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "each value in roles must be one of the following values: ADMIN, FREQUENTER, ENVIRONMENT_MANAGER",
    "Invalid id entry",
    "Invalid role entry"
  ]})
  message: string
}

export class VerifyRoleResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: true})
  message: boolean
}

export class ConflictResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: 'Already exists: ${field}'})
  message: string
}

export class IdParamInvalidResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: 'Invalid id entry'})
  message: string
}

export class NotFoundResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: ['User not found', 'User or role not found']})
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
