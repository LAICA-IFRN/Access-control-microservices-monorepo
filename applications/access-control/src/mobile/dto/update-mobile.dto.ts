import { PartialType } from '@nestjs/swagger';
import { CreateMobileDto } from './create-mobile.dto';

export class UpdateMobileDto extends PartialType(CreateMobileDto) {}
