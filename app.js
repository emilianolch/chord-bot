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

  // This is for scrape the URIs of the songs
  const fn = data.match(/fn=(.+?);/)[1]
  const hds = eval(data.match(/hds=(\[.*?\])/)[1])
  const fns = eval(data.match(/fns=(\[.*?\])/)[1])
  const NMAX = Number.parseInt(data.match(/NMAX=(\d*)/)[1])
  const path = (n) => eval(fn)

  // Parse html
  const $ = cheerio.load(data)

  // Get the list of artists and their songs
  const results = $('#s_main tbody tr')

  let songs = []

  results.each((i, el) => {
    // Get artist name
    const artist = $("td > a", el).text()

    // Get songs
    $("li", el).each((i, li) => {
      const name = $(li).text()
      const n = Number.parseInt($(li).attr('id').substring(1))

      songs.push({
        artist,
        name,
        path: path(n)
      })
    })
  })

  return songs
}