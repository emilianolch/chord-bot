require('dotenv').config()
const axios = require('axios')
const cheerio = require('cheerio');
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
  const baseUrl = "https://acordes.lacuerda.net/busca.php?canc=0&exp="
  const searchUrl = baseUrl + encodeURIComponent(msg.text)
  const { data } = await axios.get(searchUrl)
  
  const $ = cheerio.load(data)
  const results = $('#s_main tbody tr')

  results.each((i, el) => {
    console.log($(el).text())
  })
  bot.sendMessage(msg.chat.id, msg.text)

})