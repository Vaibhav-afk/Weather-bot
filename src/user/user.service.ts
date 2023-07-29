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

  async findUser(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException(`Invalid userID!`);
    return user;
  }

  async add(user: User): Promise<User> {
    const newUser = await this.userModel.create(user);
    return newUser;
  }

  async update(userId: string, user: User): Promise<User> {
    return await this.userModel.findByIdAndUpdate(userId, user, {
      new: true,
      runValidators: true,
    });
  }

  async delete(userId: string): Promise<User> {
    return await this.userModel.findByIdAndDelete(userId);
  }
}
