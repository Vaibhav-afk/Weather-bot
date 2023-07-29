import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  async getAllUsers(): Promise<User[]> {
    return this.userService.findAllUsers();
  }

  @Get(':userId')
  async getSpecificUser(
    @Param('userId')
    userId: string,
  ): Promise<User> {
    return this.userService.findUser(userId);
  }

  @Post()
  async addUser(
    @Body()
    user: {
      username: string;
      phone: number;
    },
  ): Promise<User> {
    return this.userService.add(user);
  }

  @Put('update/:userId')
  async updateUser(
    @Param('userId')
    userId: string,
    @Body()
    user: {
      username: string;
      phone: number;
    },
  ): Promise<User> {
    return this.userService.update(userId, user);
  }

  @Delete('delete/:userId')
  async deleteUser(
    @Param()
    userId: string,
  ): Promise<User> {
    return this.userService.delete(userId);
  }
}
