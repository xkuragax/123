// Получить список альбомов
export default defineEventHandler(async (event) => {
  try {
    const response = await fetch('https://alesha.chatium.ru/multiTrack2/api/albums~list')
    const albums = await response.json()
    return albums
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch albums' })
  }
})
