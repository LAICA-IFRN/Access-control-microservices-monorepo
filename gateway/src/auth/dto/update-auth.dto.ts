import { PartialType } from '@nestjs/swagger';
import { CreateAuthDto } from './login.dto';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
