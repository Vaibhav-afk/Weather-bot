import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  async getWeather(city: string): Promise<any> {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHERKEY}`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch weather data!');
    }
  }
}

/*
const axios = require('axios');

async function getChatID() {
  const token = 'YOUR_TELEGRAM_BOT_TOKEN';
  const apiUrl = `https://api.telegram.org/bot${token}/getUpdates`;

  try {
    const response = await axios.get(apiUrl);
    const updates = response.data.result;

    // Assuming the latest message is at the end of the updates array
    const latestUpdate = updates[updates.length - 1];
    const chatID = latestUpdate.message.chat.id;

    console.log('Chat ID:', chatID);
  } catch (error) {
    console.error('Error fetching updates:', error.message);
  }
}

getChatID();

*/
