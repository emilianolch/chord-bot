import { Song } from './types'
import * as lacuerda from './lacuerda'
import dotenv from 'dotenv'
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api'
//import nodeHtmlToImage, { NodeHtmlToImageOptions } from 'node-html-to-image'

dotenv.config()

const url = process.env.APP_URL || `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
const port = Number(process.env.PORT)
const token = process.env.BOT_TOKEN

// Telegram maximum message length
const MAX_LENGTH = 4096

// Initialize the bot
const options = {
  webHook: {
    port: port
  }
}
const bot = new TelegramBot(token, options)

// Inform Telegram servers of the new webhook
bot.setWebHook(`${url}/bot${token}`)

console.log(`url: ${url}`)
console.log(`port: ${port}`)
console.log(`token: ${token}`)

// Start message
bot.onText(/^\/start$/, (msg) => {
  const name = msg.from.first_name
  const text = `Hola ${name}!\n¿Qué canción estás buscando?`
  bot.sendMessage(msg.chat.id, text)
})

// Search for a song
bot.onText(/^[^\/].*/, async (msg) => {
  const songs: Song[] = (await lacuerda.scrapeSearch(msg.text)).slice(0, 5)

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
  bot.sendMessage(msg.chat.id, "Seleccioná una de estas canciones", {
    reply_markup: {
      inline_keyboard: songs.map(song => [<TelegramBot.InlineKeyboardButton>{
        text: song.label(), callback_data: song.path
      }])
    }
  })
})

// Song selected from inline keyboard
bot.on('callback_query', async (query) => {
  const imgRegex = /^CHORD_BOT_IMAGE(.*)/

  if (imgRegex.test(query.data)) {
    // User requested the song as image
    await sendImage(query.message.chat.id, query.data.match(imgRegex)[1])
  }
  else {
    await sendSong(query.message.chat.id, query.data)
  }
  bot.answerCallbackQuery(query.id)
})

// Send song
async function sendSong(chatId: number, songPath: string) {
  const document = await lacuerda.findSong(songPath)
  console.info(new Date().toString() + " GET " + songPath)

  if (document.length > MAX_LENGTH) {
    sendPages(chatId, document)
  }
  else {
    const opts: SendMessageOptions = {
      parse_mode: 'HTML',
      // reply_markup: {
      //   inline_keyboard: [[<TelegramBot.InlineKeyboardButton>{
      //     text: 'Imagen', callback_data: `CHORD_BOT_IMAGE${songPath}`
      //   }]]
      // }
    }
    bot.sendMessage(chatId, document, opts)
  }
}

// Send song as image
async function sendImage(chatId: number, songPath: string) {
  // const document = await lacuerda.findSong(songPath)
  // const opts: NodeHtmlToImageOptions = {
  //   html: document,
  //   puppeteerArgs: {
  //     defaultViewport: {
  //       width: 480,
  //       height: 853
  //     }
  //   }
  // }
  // const image = await nodeHtmlToImage(opts) as Buffer
  // bot.sendPhoto(chatId, image)
}


// Split document in pages smaller than maximum message length.
// This needs some testing. I don't know if it actually works.
async function sendPages(chatId: number, document: string) {
  // We need enough space to add <pre> tags if required.
  const max = MAX_LENGTH - 7

  // The document must be splited at a blank line, 
  // so first find all occurrences of two new line characters in a row.
  const matches = [...document.matchAll(/\n\n/g)]

  // Select last match with index lesser than max length.
  const indexes = matches.map(m => m.index).filter(i => i < max)
  const splitIndex = indexes[indexes.length - 1]

  // Split the document
  let page: string = document.slice(0, splitIndex)
  const rest = document.slice(splitIndex)

  // Add pre tags if required
  if (!page.match(/<pre>/)) page = `<pre>${page}`
  if (!page.match(/<\/pre>/)) page = `${page}</pre>`

  // Send page
  await bot.sendMessage(chatId, page, { parse_mode: "HTML" })

  // Send the rest of the document
  if (rest.length > 0) {
    sendPages(chatId, rest)
  }
}