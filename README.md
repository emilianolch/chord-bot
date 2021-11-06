# ChordBot
Telegram bot for getting song lyrics and chords.

Currently the bot gets the lyrics from [lacuerda.net](https://lacuerda.net), so only songs in Spanish are supported.

## Live demo
There is a live version of this bot (it only speaks Spanish). Just contact [@Letras y Acordes](https://telegram.me/LetrasAcordesBot) and start searching for songs.

## Install
* Clone the repo.
* Contact the BotFather and create a bot.
* Create the file `.env` in the root of your cloned repository and put your bot's API token into it:   
`BOT_TOKEN=<your-bot-api-token>`
* Transpile to Javascript: `tsc`
* Start server: `node dist/main.js`

## TODO
* Split response message when is >4096 characters (WIP)
* Option for getting the song as image.
* Option for getting the song as PDF.
* Collect usage information into a database.
* Command to query chord positions. It should return a picture of any guitar chord.
* Command to query song history. It should return the last n songs retrieved by the user.
* Supprt other sources of lyrics.
* Link the chords on lyrics to the command for querying its picture. (It's just an idea. I don't know if it's actually possible.)