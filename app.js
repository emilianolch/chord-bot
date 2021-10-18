require('dotenv').config()
const lacuerda = require('./lacuerda')
const TelegramBot = require('node-telegram-bot-api')
//const nodeHtmlToImage = require('node-html-to-image');

// Telegram maximum message length
const MAX_LENGTH = 4096

// Initialize the bot
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
    bot.sendMessage(msg.chat.id, "Lo siento, no pude encontrar esa canción. Recordá ingresar el nombre de la canción y el intérprete.")
    return
  }

  // If there is only one result, send it to the client.
  if (songs.length === 1) {
    return sendSong(msg.chat.id, songs[0].path)
  }

  // Display the inline keyboard to select from the first five results.
  const opts = {
    reply_markup: JSON.stringify({
      inline_keyboard: songs.map(song => [{ text: song.title, callback_data: song.path }]),
    }),
  };
  bot.sendMessage(msg.chat.id, "Seleccioná una de estas canciones", opts)
})

// Song selected from inline keyboard
bot.on('callback_query', async (query) => {
  await sendSong(query.message.chat.id, query.data)
  bot.answerCallbackQuery(query.id)
})

// Send song
async function sendSong(chatId, songPath) {
  const document = await lacuerda.findSong(songPath)

  if (document.length > MAX_LENGTH) {
    return sendMultiplePages(chatId, document)
  }

  bot.sendMessage(chatId, document, { parse_mode: "HTML" })
}

// Split document in pages smaller than maximum message length.
async function sendMultiplePages(chatId, document) {

  // The document must be splited at a blank line, 
  // so first find all occurrences of two new line characters in a row.
  const matches = [...document.matchAll(/\n\n/g)]

  // Select last match with index lesser than max length.
  const indexes = matches.map(m => m.index).filter(i => i < MAX_LENGTH)
  const splitIndex = indexes[indexes.length - 1]

  console.log(splitIndex)
  // TODO
  // Make a recursive method that also appends <pre> tags
}

//const image = await nodeHtmlToImage({ html: document })
//bot.sendPhoto(query.message.chat.id, image)
