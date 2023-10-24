import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { CreateMobileDto } from './dto/create-mobile.dto';
import { UpdateMobileDto } from './dto/update-mobile.dto';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}
  
}
