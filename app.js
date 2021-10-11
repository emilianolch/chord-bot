require('dotenv').config()
const axios = require('axios')
const TelegramBot = require('node-telegram-bot-api')

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

// Start message
bot.onText(/^\/start$/, (msg) => {
  const name = msg.from.first_name
  const text = `Hola ${name}!\n¿Qué canción estás buscando?`
  bot.sendMessage(msg.chat.id, text)
})

// Search for a song
bot.onText(/^[^\/].*/, (msg) => {
  const baseUrl = "https://acordes.lacuerda.net/busca.php?canc=0&exp="
  const searchUrl = baseUrl + encodeURIComponent(msg.text)

  axios.get(searchUrl).then(response => {
    console.log(response.data)
    bot.sendMessage(msg.chat.id, msg.text)
  })
})