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

  async getAllSubscribedUsers(): Promise<User[]> {
    // Find all users where isSubscribed set to true
    return this.userModel.find({ isSubscribed: true }).exec();
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

  async updateSubscriptionStatus(
    chatId: number,
    isSubscribed: boolean,
  ): Promise<User> {
    return await this.userModel.findOneAndUpdate(
      { chatId },
      { $set: { isSubscribed: isSubscribed } },
      { new: true },
    );
  }

  async updateLocation(
    chatId: number,
    location: [number, number],
  ): Promise<User | null> {
    // Find the user in the database using the chatId
    const user = await this.userModel.findOne({ chatId });

    if (user) {
      // Update the user's location
      user.location = location;

      // Save the updated user in the database
      const updatedUser = await user.save();

      return updatedUser;
    }

    return null; // Return null if the user is not found
  }

  async delete(chatId: number): Promise<User> {
    return await this.userModel.findByIdAndDelete(chatId);
  }
}
