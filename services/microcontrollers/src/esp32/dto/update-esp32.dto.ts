import { PartialType } from '@nestjs/mapped-types';
import { CreateEsp32Dto } from './create-esp32.dto';

export class UpdateEsp32Dto extends PartialType(CreateEsp32Dto) {}
