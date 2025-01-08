import { Controller, Post, Body } from '@nestjs/common';
import { AccessService } from './access.service';
import { CreateAccessDto } from './dto/create-access.dto';
import { FindAllDto } from 'src/utils/find-all.dto';

@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post()
  create(@Body() createAccessDto: CreateAccessDto) {
    return this.accessService.create(createAccessDto);
  }

  @Post('search')
  findAll(@Body() findAllDto: FindAllDto) {
    return this.accessService.findAll(findAllDto);
  }
}
