import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
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

  @Get('subscribers')
  async getAllSubscribedUsers(): Promise<User[]> {
    return this.userService.getAllSubscribedUsers();
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
      location: [number, number];
    },
  ): Promise<User> {
    return this.userService.add(user);
  }

  @Put('updatesubscriptionstatus/:chatId')
  async updateSubscriptionStatus(
    @Param('chatId')
    chatId: number,
    @Body('isSubscribed') isSubscribed: boolean,
  ): Promise<User> {
    return this.userService.updateSubscriptionStatus(chatId, isSubscribed);
  }

  @Put('updatelocation')
  async updateLocation(
    @Body('chatId') chatId: number,
    @Body('location') location: [number, number],
  ): Promise<User | null> {
    const updatedLocation = await this.userService.updateLocation(
      chatId,
      location,
    );

    if (updatedLocation) {
      return updatedLocation;
    } else {
      throw new NotFoundException('User not found');
    }
  }

  @Delete('delete/:chatId')
  async deleteUser(
    @Param()
    chatId: number,
  ): Promise<User> {
    return this.userService.delete(chatId);
  }
}
