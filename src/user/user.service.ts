import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import * as mongoose from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}

  async findAllUsers(): Promise<User[]> {
    const users = await this.userModel.find();
    return users;
  }

  async findUser(chatId: number): Promise<User> {
    const user = await this.userModel.findOne({ chatId });
    // if (!user) throw new NotFoundException(`Invalid chatID!`);
    if (!user) return null;
    return user;
  }

  async add(user: User): Promise<User> {
    const newUser = await this.userModel.create(user);
    return newUser;
  }

  async update(chatId: number, user: User): Promise<User> {
    return await this.userModel.findOneAndUpdate(
      { chatId },
      { $set: { isSubscribed: user.isSubscribed } },
      { new: true },
    );
  }

  async delete(chatId: number): Promise<User> {
    return await this.userModel.findByIdAndDelete(chatId);
  }
}
