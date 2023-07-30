import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { WeatherModule } from '../weather/weather.module';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../user/user.schema';
import { UserService } from 'src/user/user.service';
import { WeatherService } from 'src/weather/weather.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    WeatherModule,
    UserModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ScheduleModule.forRoot(), // Add ScheduleModule
  ],
  providers: [TelegramService, UserService, WeatherService],
})
export class TelegramModule {}
