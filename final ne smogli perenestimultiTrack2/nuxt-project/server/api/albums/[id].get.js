// Получить альбом по ID
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  try {
    const response = await fetch(`https://alesha.chatium.ru/multiTrack2/api/albums~${id}`)
    const album = await response.json()
    return album
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Failed to fetch album' })
  }
})
