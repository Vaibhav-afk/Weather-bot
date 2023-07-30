import { Injectable } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';
import { UserService } from '../user/user.service';
import { Telegraf, session } from 'telegraf';
import axios from 'axios';

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
    this.bot.command('weathernow', this.getWeatherForCity.bind(this));
    this.bot.hears(/.*/, this.handleMessage.bind(this));
    this.bot.hears('location', this.handleLocation.bind(this));

    this.bot.launch();
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
        `Hello, ${existingUser.username}! Welcome back to the Weather Bot!\n\n` +
        'Use the /subscribe command to get daily weather updates.\n' +
        (existingUser.isSubscribed
          ? 'Use the /unsubscribe command to unsubscribe from daily weather updates.'
          : '') +
        `\n`;
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
      await this.userService.add({
        username: messageText,
        chatId: chatId,
        isSubscribed: false,
        isAdmin: false,
      }); // Create a new user with chatID and username

      // Respond to the user with a welcome message or any other response
      const welcomeMessage =
        `Hello, ${messageText}! Welcome to the Weather Bot!\n\n` +
        'Use the /subscribe command to get daily weather updates.';

      // Set awaitingUsername to false in the context to avoid processing the next message as a username input
      ctx.session.awaitingUsername = false;

      ctx.reply(welcomeMessage);
    }
  }

  private async handleSubscribeCommand(ctx: any) {
    const chatId = ctx.from.id; // Get the user's chat ID

    // Find the user in the database
    const user = await this.userService.findUser(chatId);

    if (user) {
      await this.userService.update(chatId, { ...user, isSubscribed: true });

      ctx.reply('You are now subscribed for daily weather updates! 🌞🌦️');
    } else {
      // When the user is not found in the database
      ctx.reply(
        'Sorry, we could not find your user profile. Please use the /start command to get started.',
      );
    }
  }

  private async handleUnsubscribeCommand(ctx: any) {
    const chatId = ctx.from.id; // Get the user's chat ID

    // Find the user in the database
    const user = await this.userService.findUser(chatId);

    if (user) {
      await this.userService.update(chatId, { ...user, isSubscribed: false });

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

  private async handleLocation(ctx: any) {
    const { latitude, longitude } = ctx.message.location;
    const city = await this.getCityFromCoordinates(latitude, longitude);

    this.getWeatherForCity(city)
      .then((weatherData) => {
        ctx.reply(
          `Weather for ${city}:\nTemperature: ${weatherData.main.temp}°C`,
        );
      })
      .catch((error) => {
        ctx.reply('Failed to fetch weather data!');
      });
  }

  private async getWeatherForCity(city: string): Promise<any> {
    //fetching weather data from weather module
    const weatherData = await this.weatherService.getWeather(city);
    return weatherData;
  }
}
