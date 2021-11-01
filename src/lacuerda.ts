import axios from 'axios'
import cheerio from 'cheerio'

// Make a search query to lacuerda.net
export const scrapeSearch = async (queryString: string) => {
  const baseUrl = "https://acordes.lacuerda.net/busca.php?canc=0&exp="
  const searchUrl = baseUrl + encodeURIComponent(queryString)
  const { data } = await axios.get<string>(searchUrl)

  // This is for scrape the URIs of the songs
  let path: (n: number) => string;

  try {
    const fn = data.match(/fn=(.+?);/)[1]
    const hds = eval(data.match(/hds=(\[.*?\])/)[1])
    const fns = eval(data.match(/fns=(\[.*?\])/)[1])
    const NMAX = Number.parseInt(data.match(/NMAX=(\d*)/)[1])
    path = (n) => eval(fn)
  }
  catch {
    // No search results
    return []
  }

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
        title: `${artist} - ${name}`,
        path: path(n)
      })
    })
  })

  return songs
}

// Find a song and return best version
export const findSong = async (path: string) => {
  const baseUrl = "https://acordes.lacuerda.net/"
  const songUrl = baseUrl + path

  // First, load the versions page
  let { data } = await axios.get(songUrl)
  let $ = cheerio.load(data)

  // Scrape best version
  const index = $('#rThumbs ul li:first').attr('onclick')
    .match(/\d+/)[0]
  const versionUrl = index === "1" ? songUrl + ".shtml" : `${songUrl}-${index}.shtml`

  // Load version page
  data = (await axios.get(versionUrl)).data
  $ = cheerio.load(data)

  // Remove Telegram unsupported tags
  $('#t_body div').remove()

  const songName = $('#tH1 h1 a').text()
  const artistName = $('#tH1 h2 a').text()
  const document = $('#t_body')

  // Add header and footer
  document.prepend(`<strong>${songName}</strong>\n${artistName}\n\n`)
  document.append('\n\n🔃 Si el contenido no se ve correctamente rotá la pantalla.')

  return document.html();
}