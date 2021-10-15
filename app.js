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
  const songs = (await lacuerda.scrapeSearch(msg.text)).slice(0, 5)

  // Song not found
  if (songs.length === 0) {
    bot.sendMessage(msg.chat.id, "Lo siento, no pude encontrar esa canción :-(")
    return
  }

  const opts = {
    reply_markup: JSON.stringify({
      inline_keyboard: songs.map(song => [{ text: song.title, callback_data: song.path }]),
      remove_keyboard: true, // not working
    }),
  };

  bot.sendMessage(msg.chat.id, "Selecciona una de estas canciones", opts)
})

// Song selected
bot.on('callback_query', async (query) => {
  const song = await lacuerda.findSong(query.data)
  bot.sendMessage(query.message.chat.id, "done!")
  bot.answerCallbackQuery(query.id)
})