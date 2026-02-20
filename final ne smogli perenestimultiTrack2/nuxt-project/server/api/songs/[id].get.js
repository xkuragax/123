// Получить песню с треками и альбомом
export default defineEventHandler(async (event) => {
  const songId = getRouterParam(event, 'id')
  
  try {
    // Получаем песню
    const songResponse = await fetch(`https://alesha.chatium.ru/multiTrack2/api/albums~songs/${songId}`)
    const song = await songResponse.json()
    
    if (!song) {
      throw createError({ statusCode: 404, message: 'Song not found' })
    }
    
    // Получаем альбом
    const albumResponse = await fetch(`https://alesha.chatium.ru/multiTrack2/api/albums~${song.albumId}`)
    const album = await albumResponse.json()
    
    // Получаем треки
    const tracksResponse = await fetch(`https://alesha.chatium.ru/multiTrack2/api/albums~tracks/by-song/${songId}`)
    const tracks = await tracksResponse.json()
    
    return { song, album, tracks }
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch song data' })
  }
})
