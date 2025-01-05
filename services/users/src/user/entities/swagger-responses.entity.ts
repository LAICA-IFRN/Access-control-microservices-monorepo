import { ApiProperty, ApiResponseProperty } from "@nestjs/swagger";
import { UUID } from "crypto";

export class BadRequestResponseEntity {
  @ApiProperty()
  @ApiResponseProperty({example: [
    "email must be an email",
    "each value in roles must be one of the following values: ADMIN, FREQUENTER, ENVIRONMENT_MANAGER",
    "mac must be a MAC Address",
    "envId must be a UUID",
    "name must be a string",
    "registration must be a string",
    "identifier must be a string",
    "password must be a string",
    "Invalid CPF or CNPJ provided",
    "Admin user cannot have other roles"
  ]})
  message: string
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
  @ApiResponseProperty({example: 'No user found'})
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

export class NotFoundToAccess {
  @ApiProperty()
  @ApiResponseProperty({ example: 404 })
  message: number
}

export class OkToAccess {
  @ApiProperty()
  @ApiResponseProperty({ example: 'UUID' })
  message: string
}

export class UnauthorizedToAccess {
  @ApiProperty()
  @ApiResponseProperty({ example: 401 })
  message: number
}

export class OkToToken {
  @ApiProperty()
  @ApiResponseProperty({ example: 'd39dadcf-9562-472c-b8c1-a7c4e6312f07' })
  userId: UUID
}

export class UnauthorizedToToken {
  @ApiProperty()
  @ApiResponseProperty({ example: 'Incorrect password' })
  message: string
}

export class NotFoundToToken {
  @ApiProperty()
  @ApiResponseProperty({ example: 'User not found' })
  message: string
}
