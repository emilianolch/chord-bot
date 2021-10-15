require('dotenv').config()
const lacuerda = require('./lacuerda')
const TelegramBot = require('node-telegram-bot-api')

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

// Start message
bot.onText(/^\/start$/, (msg) => {
  const name = msg.from.first_name
  const text = `Hola ${name}!\n¿Qué canción estás buscando?`
  bot.sendMessage(msg.chat.id, text)
})

// Search for a song
bot.onText(/^[^\/].*/, async (msg) => {
  const songs = await lacuerda.scrapeSearch(msg.text)
  const message = songs.slice(0, 5).map(song => `${song.artist} - ${song.name}`).join('\n')

  bot.sendMessage(msg.chat.id, message)
})

