require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Start message
bot.onText(/^\/start$/, (msg) => {
  bot.sendMessage(msg.chat.id, "Hola!");
})