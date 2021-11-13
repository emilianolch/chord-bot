export class Song {
  name: string
  artist: string
  path: string

  constructor(name: string, artist: string, path: string) {
    this.name = name
    this.artist = artist
    this.path = path
  }

  label(): string {
    return `${this.artist} - ${this.name}`
  }
}