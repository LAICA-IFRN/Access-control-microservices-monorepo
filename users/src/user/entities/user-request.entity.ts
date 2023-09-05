import { Request } from 'express';
import { User } from '@prisma/client';

export interface UserRequestEntity extends Request {
  user: User;
}