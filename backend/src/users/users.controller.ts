import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.usersService.findAll(req.tenantId);
  }
}

