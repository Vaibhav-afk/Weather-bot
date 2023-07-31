import { Injectable } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';
import { UserService } from '../user/user.service';
import { Telegraf, session } from 'telegraf';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TelegramService {
  private bot: Telegraf;

  constructor(
    private readonly userService: UserService,
    private readonly weatherService: WeatherService,
  ) {
    this.bot = new Telegraf(process.env.TELEGRAMTOKEN);

    //Bot commands
    this.bot.use(session());
    this.bot.command('start', this.handleStartCommand.bind(this));
    this.bot.command('subscribe', this.handleSubscribeCommand.bind(this));
    this.bot.command('unsubscribe', this.handleUnsubscribeCommand.bind(this));
    this.bot.command('updateLocation', this.handleLocationUpdate.bind(this));
    // this.bot.command('getweather', this.scheduleDailyWeatherUpdate.bind(this));
    this.bot.hears(/.*/, this.handleMessage.bind(this));
    // this.bot.hears('location', this.handleLocation.bind(this));

    this.bot.launch();
    this.scheduleDailyWeatherUpdate();
  }

  private async handleStartCommand(ctx: any) {
    const chatId = ctx.from.id; // Get the user's chat ID

    // Check if the user already exists in the database
    const existingUser = await this.userService.findUser(chatId);

    if (!existingUser) {
      // If the user does not exist, prompt the user to enter their desired username
      ctx.reply('Please enter your desired username:');
      // Store the current user's chat ID in the context to handle the next message with the username
      ctx.session = { chatId, awaitingUsername: true };
    } else {
      const welcomeMessage =
        `Hello, ${existingUser.username}! 👋 \nWelcome back to the Weather Bot 🌤️🌈\n\n` +
        (existingUser.isSubscribed
          ? 'Use the /unsubscribe command to unsubscribe from daily weather updates.\n\n'
          : 'Use the /subscribe command to get daily weather updates.\n\n') +
        'Use the /updateLocation command to update your location.\n';
      ctx.reply(welcomeMessage);
    }
  }

  private async handleMessage(ctx: any) {
    const chatId = ctx.from.id; // Get the user's chat ID
    const messageText = ctx.message.text; // Get the message text for username
    console.log('Received Message from User:', ctx.from.id);
    console.log('Message Text:', ctx.message.text);

    // Check if the user is awaiting a username input
    if (ctx.session.awaitingUsername) {
      ctx.session.username = messageText; //username
      const username = ctx.session.username;

      ctx.reply(
        `Hello, ${messageText}! Welcome to the Weather Bot!\n\n` +
          'Please share your live location to update it.\n\nClick on attachment 📎 option, choose "Location", and share your location.',
      );

      ctx.session.awaitingUsername = false;
      ctx.session = { chatId, awaitingLocation: true };
      ctx.session.username;

      this.bot.on('message', async (ctx: any) => {
        // Check if the message has an attachment and it is a location
        if (ctx.message && ctx.message.location) {
          this.addNewUser(ctx, username);
        }
      });
    }
  }

  private async addNewUser(ctx: any, username: string) {
    console.log(username);
    if (ctx.session && ctx.session.awaitingLocation) {
      const chatId = ctx.from.id;
      const { latitude, longitude } = ctx.message.location;

      // adding new user to the database
      await this.userService.add({
        username: username,
        chatId: chatId,
        isSubscribed: false,
        isAdmin: false,
        location: [latitude, longitude],
      });

      ctx.session.awaitingLocation = false;

      // Respond to the user with a confirmation message
      ctx.reply(
        'Thankyou! for providing location 😊.\n\nYou can now use the /subscribe command to get daily weather updates.🌈🌤️',
      );
    }
  }

  private async handleSubscribeCommand(ctx: any) {
    const chatId = ctx.from.id; // Get the user's chat ID

    // Find the user in the database
    const user = await this.userService.findUser(chatId);

    if (user) {
      await this.userService.updateSubscriptionStatus(chatId, true);

      ctx.reply(
        'You are now subscribed for daily weather updates! 🌞🌦️\n\nYou can unsubscribe anytime using /unsubscribe command',
      );
    } else {
      // When the user is not found in the database
      ctx.reply(
        'Sorry, we could not find your user profile. Please use the /start command to get started.',
      );
    }
  }

  private async handleUnsubscribeCommand(ctx: any) {
    const chatId = ctx.from.id; // user's chat ID

    const user = await this.userService.findUser(chatId);

    if (user) {
      await this.userService.updateSubscriptionStatus(chatId, false);

      ctx.reply('You are now unsubscribed from daily weather updates😔🌦️');
    } else {
      // When the user is not found in the database
      ctx.reply(
        'Sorry, we could not find your user profile. Please use the /start command to get started.',
      );
    }
  }

  private async getCityFromCoordinates(
    latitude: number,
    longitude: number,
  ): Promise<string> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLEAPI}`;

    try {
      const response = await axios.get(url);
      const results = response.data.results;
      if (results.length > 0) {
        // Extract the city from the response
        const city = results[0].address_components.find((component: any) =>
          component.types.includes('locality'),
        );

        if (city) {
          return city.long_name;
        }
      }
    } catch (error) {
      console.error('Error fetching city name:', error.message);
    }

    return 'Unknown City';
  }

  private async handleLocationUpdate(ctx: any) {
    const chatId = ctx.from.id;

    // Request the user to share their live location
    ctx.reply(
      'Please share your live location to update it.\n\nClick on attachment 📎 option, choose "Location", and share your location.',
    );

    // Store the chatId in the session to handle the next message with the location
    ctx.session = { chatId, awaitingLocation: true };

    console.log(ctx.message);

    this.bot.on('message', (ctx: any) => {
      // Check if the message has an attachment and it is a location
      if (ctx.message && ctx.message.location) {
        this.handleUpdate(ctx);
      }
    });
  }

  private async handleUpdate(ctx: any) {
    if (ctx.session && ctx.session.awaitingLocation) {
      const chatId = ctx.from.id;
      const { latitude, longitude } = ctx.message.location;

      // Update the user's location in the context
      ctx.session.location = { latitude, longitude };

      // Update the user's location in the database
      await this.userService.updateLocation(chatId, [latitude, longitude]);

      ctx.session.awaitingLocation = false;

      // Respond to the user with a confirmation message
      ctx.reply('Your location has been updated successfully✨');
    }
  }

  @Cron('0 0 9 30 * *') // Schedule the task to run every day at 9 AM.
  private async scheduleDailyWeatherUpdate() {
    const subscribedUsers = await this.userService.getAllSubscribedUsers();

    console.log(subscribedUsers.length);

    for (const user of subscribedUsers) {
      const [latitude, longitude] = user.location;
      const city = await this.getCityFromCoordinates(latitude, longitude);

      try {
        const weatherData = await this.weatherService.getWeather(city);
        const weatherUpdateMessage = `Weather for ${city}:\nTemperature: ${
          weatherData.main.temp - 273.15
        }°C`;
        this.sendMessage(user.chatId, weatherUpdateMessage);
      } catch (error) {
        console.error('Failed to fetch weather data:', error.message);
      }
    }
  }

  // Helper method to send a message to a user
  async sendMessage(chatId: number, message: string) {
    try {
      await this.bot.telegram.sendMessage(chatId, message);
    } catch (error) {
      console.error('Failed to send message:', error.message);
    }
  }
}
