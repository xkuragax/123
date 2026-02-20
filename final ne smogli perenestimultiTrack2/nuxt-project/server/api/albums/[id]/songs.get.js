// Получить песни альбома
export default defineEventHandler(async (event) => {
  const albumId = getRouterParam(event, 'id')
  
  try {
    const response = await fetch(`https://alesha.chatium.ru/multiTrack2/api/albums~songs/by-album/${albumId}`)
    const songs = await response.json()
    return songs
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch songs' })
  }
})
