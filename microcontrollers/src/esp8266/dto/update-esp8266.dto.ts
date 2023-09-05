import { PartialType } from '@nestjs/swagger';
import { CreateEsp8266Dto } from './create-esp8266.dto';

export class UpdateEsp8266Dto extends PartialType(CreateEsp8266Dto) {}
