// Получить все песни для админки
export default defineEventHandler(async (event) => {
  try {
    // Получаем все альбомы
    const albumsResponse = await fetch('https://alesha.chatium.ru/multiTrack2/api/albums~list')
    const albums = await albumsResponse.json()
    
    // Получаем песни для всех альбомов
    const allSongs = []
    for (const album of albums) {
      const songsResponse = await fetch(`https://alesha.chatium.ru/multiTrack2/api/albums~songs/by-album/${album.id}`)
      const songs = await songsResponse.json()
      allSongs.push(...songs.map(s => ({ ...s, albumId: album.id })))
    }
    
    return allSongs
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch songs' })
  }
})
