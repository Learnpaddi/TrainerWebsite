import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CoursesService, CreateCourseDto } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.coursesService.findAll(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.coursesService.findOne(id, req.tenantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createCourseDto: CreateCourseDto, @Req() req: any) {
    return this.coursesService.create(createCourseDto, req.tenantId);
  }
}

