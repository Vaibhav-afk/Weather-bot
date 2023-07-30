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

  @Get(':chatId')
  async getSpecificUser(
    @Param('chatId')
    chatId: number,
  ): Promise<User> {
    return this.userService.findUser(chatId);
  }

  @Post()
  async addUser(
    @Body()
    user: {
      username: string;
      chatId: number;
      isSubscribed: boolean;
      isAdmin: boolean;
    },
  ): Promise<User> {
    return this.userService.add(user);
  }

  @Put('update/:chatId')
  async updateUser(
    @Param('chatId')
    chatId: number,
    @Body()
    user: {
      username: string;
      chatId: number;
      isSubscribed: boolean;
      isAdmin: boolean;
    },
  ): Promise<User> {
    return this.userService.update(chatId, user);
  }

  @Delete('delete/:chatId')
  async deleteUser(
    @Param()
    chatId: number,
  ): Promise<User> {
    return this.userService.delete(chatId);
  }
}
