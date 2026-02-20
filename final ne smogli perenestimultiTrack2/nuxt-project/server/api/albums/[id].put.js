// Обновить альбом
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  try {
    const response = await fetch(`https://alesha.chatium.ru/multiTrack2/api/albums~update/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const result = await response.json()
    return result
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Failed to update album' })
  }
})
