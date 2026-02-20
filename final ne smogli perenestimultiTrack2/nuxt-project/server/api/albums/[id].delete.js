// Удалить альбом
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  try {
    const response = await fetch(`https://alesha.chatium.ru/multiTrack2/api/albums~delete/${id}`, {
      method: 'POST'
    })
    const result = await response.json()
    return result
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Failed to delete album' })
  }
})
