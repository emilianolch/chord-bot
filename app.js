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

  const fn = data.match(/fn=.+?;/)[0]
  // fn=''+hds[n]+'/'+fns[n];
  // fn=''+hds[NMAX-n]+'/'+fns[NMAX-n];
  // fn=''+hds[NMAX-n]+'/'+fns[n];
  // fn=''+hds[n]+'/'+fns[n];

  const hds = eval(data.match(/hds=(\[.*?\])/)[1])
  const fns = eval(data.match(/fns=(\[.*?\])/)[1])
  const nmax = data.match(/NMAX=\d*/)[0]

  console.log(fn)
  console.log(nmax)
  console.log(hds)
  console.log(fns)

  const $ = cheerio.load(data)
  
  // Artists and songs result
  const results = $('#s_main tbody tr')

  let songs = []

  results.each((i, el) => {
    // Get artist name
    const artist = $("td > a", el)
    const basePath = artist.attr("href").match(/[^\/]\w*\/$/)[0]

    // Get songs
    $("li", el).each((i, li) => {
      const name = $(li).text()
      
      // Replace spaces with underscores
      let songPath =  name.replace(/\s/g, "_")
      // Replace spanish special characters
      songPath = songPath.normalize("NFD").replace(/\p{Diacritic}/gu, "")
      
      songs.push({
        artist: artist.text(),
        name,
        path: basePath + songPath
      })
    })
  })
  return songs
}