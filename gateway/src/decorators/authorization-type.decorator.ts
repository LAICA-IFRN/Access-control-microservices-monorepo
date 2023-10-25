import { SetMetadata } from '@nestjs/common';

export const AuthorizationType = (arg: string) => SetMetadata('authorization-type', arg);