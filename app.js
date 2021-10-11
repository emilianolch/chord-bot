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
  const songs = await scrapeSearch(msg.text)
  const message = songs.slice(0, 5).map(song => `${song.artist} - ${song.name}`).join('\n')

  bot.sendMessage(msg.chat.id, message)
})

// Make a search query to lacuerda.net
async function scrapeSearch(queryString) {
  const baseUrl = "https://acordes.lacuerda.net/busca.php?canc=0&exp="
  const searchUrl = baseUrl + encodeURIComponent(queryString)
  const { data } = await axios.get(searchUrl)

  const $ = cheerio.load(data)
  const results = $('#s_main tbody tr')

  let songs = []

  results.each((i, el) => {
    const artist = $(el).children("td:first").text().substring(1);
    $("li", el).each((i, li) => {
      songs.push({
        artist,
        name: $(li).text()
      })
    })
  })

  return songs
}