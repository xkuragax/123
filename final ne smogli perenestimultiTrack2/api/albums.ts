import Albums from "../tables/albums.table"
import Songs from "../tables/songs.table"
import Tracks from "../tables/tracks.table"

export const apiAlbumsListRoute = app.get('/list', async (ctx, req) => {
  const albums = await Albums.findAll(ctx, {
    order: [{ sortOrder: 'asc' }],
    limit: 1000
  })
  return albums
})

export const apiAlbumByIdRoute = app.get('/:id', async (ctx, req) => {
  const album = await Albums.findById(ctx, req.params.id)
  if (!album) {
    throw new Error('Album not found')
  }
  return album
})

export const apiAlbumsCreateRoute = app.post('/create', async (ctx, req) => {
  const album = await Albums.create(ctx, {
    title: req.body.title,
    artist: req.body.artist,
    coverHash: req.body.coverHash,
    year: req.body.year,
    sortOrder: req.body.sortOrder
  })
  return album
})

export const apiAlbumsUpdateRoute = app.post('/update/:id', async (ctx, req) => {
  const album = await Albums.update(ctx, {
    id: req.params.id,
    title: req.body.title,
    artist: req.body.artist,
    coverHash: req.body.coverHash,
    year: req.body.year,
    sortOrder: req.body.sortOrder
  })
  return album
})

export const apiAlbumsDeleteRoute = app.post('/delete/:id', async (ctx, req) => {
  const albumId = req.params.id
  
  const songs = await Songs.findAll(ctx, {
    where: { albumId },
    limit: 1000
  })
  
  for (const song of songs) {
    const tracks = await Tracks.findAll(ctx, {
      where: { songId: song.id },
      limit: 1000
    })
    
    for (const track of tracks) {
      await Tracks.delete(ctx, track.id)
    }
    
    await Songs.delete(ctx, song.id)
  }
  
  const album = await Albums.delete(ctx, albumId)
  return { success: true, album }
})

export const apiSongsByAlbumRoute = app.get('/songs/by-album/:albumId', async (ctx, req) => {
  const songs = await Songs.findAll(ctx, {
    where: { albumId: req.params.albumId },
    order: [{ trackNumber: 'asc' }],
    limit: 1000
  })
  
  const songsWithTracksCount = await Promise.all(
    songs.map(async (song) => {
      const tracksCount = await Tracks.countBy(ctx, { songId: song.id })
      return {
        ...song,
        tracksCount
      }
    })
  )
  
  return songsWithTracksCount
})

export const apiSongByIdRoute = app.get('/songs/:id', async (ctx, req) => {
  const song = await Songs.findById(ctx, req.params.id)
  if (!song) {
    throw new Error('Song not found')
  }
  return song
})

export const apiSongsCreateRoute = app.post('/songs/create', async (ctx, req) => {
  const song = await Songs.create(ctx, {
    albumId: req.body.albumId,
    title: req.body.title,
    trackNumber: req.body.trackNumber,
    lyrics: req.body.lyrics,
    tabsUrl: req.body.tabsUrl,
    stemsUrl: req.body.stemsUrl,
    duration: req.body.duration
  })
  return song
})

export const apiSongsUpdateRoute = app.post('/songs/update/:id', async (ctx, req) => {
  const song = await Songs.update(ctx, {
    id: req.params.id,
    albumId: req.body.albumId,
    title: req.body.title,
    trackNumber: req.body.trackNumber,
    lyrics: req.body.lyrics,
    tabsUrl: req.body.tabsUrl,
    stemsUrl: req.body.stemsUrl,
    duration: req.body.duration
  })
  return song
})

export const apiSongsDeleteRoute = app.post('/songs/delete/:id', async (ctx, req) => {
  const songId = req.params.id
  
  const tracks = await Tracks.findAll(ctx, {
    where: { songId },
    limit: 1000
  })
  
  for (const track of tracks) {
    await Tracks.delete(ctx, track.id)
  }
  
  const song = await Songs.delete(ctx, songId)
  return { success: true, song }
})

export const apiTracksBySongRoute = app.get('/tracks/by-song/:songId', async (ctx, req) => {
  const tracks = await Tracks.findAll(ctx, {
    where: { songId: req.params.songId },
    order: [{ sortOrder: 'asc' }],
    limit: 1000
  })
  return tracks
})

export const apiTracksCreateRoute = app.post('/tracks/create', async (ctx, req) => {
  const track = await Tracks.create(ctx, {
    songId: req.body.songId,
    name: req.body.name,
    fileHash: req.body.fileHash,
    sortOrder: req.body.sortOrder,
    color: req.body.color
  })
  return track
})

export const apiTracksUpdateRoute = app.post('/tracks/update/:id', async (ctx, req) => {
  const track = await Tracks.update(ctx, {
    id: req.params.id,
    songId: req.body.songId,
    name: req.body.name,
    fileHash: req.body.fileHash,
    sortOrder: req.body.sortOrder,
    color: req.body.color
  })
  return track
})

export const apiTracksDeleteRoute = app.post('/tracks/delete/:id', async (ctx, req) => {
  const track = await Tracks.delete(ctx, req.params.id)
  return { success: true, track }
})

export const apiReorderAlbumsRoute = app.post('/reorder', async (ctx, req) => {
  const updates = req.body.albums
  const promises = updates.map((item, index) => 
    Albums.update(ctx, { id: item.id, sortOrder: index })
  )
  await Promise.all(promises)
  return { success: true }
})

export const apiReorderSongsRoute = app.post('/songs/reorder', async (ctx, req) => {
  const updates = req.body.songs
  const promises = updates.map((item, index) => 
    Songs.update(ctx, { id: item.id, trackNumber: index + 1 })
  )
  await Promise.all(promises)
  return { success: true }
})

export const apiReorderTracksRoute = app.post('/tracks/reorder', async (ctx, req) => {
  const updates = req.body.tracks
  const promises = updates.map((item, index) => 
    Tracks.update(ctx, { id: item.id, sortOrder: index })
  )
  await Promise.all(promises)
  return { success: true }
})

export const apiPublicSongRoute = app.get('/public/song/:songId', async (ctx, req) => {
  const song = await Songs.findById(ctx, req.params.songId)
  if (!song) {
    throw new Error('Song not found')
  }

  const album = await Albums.findById(ctx, song.albumId.id)
  
  const tracks = await Tracks.findAll(ctx, {
    where: { songId: req.params.songId },
    order: [{ sortOrder: 'asc' }],
    limit: 1000
  })

  return {
    song: {
      id: song.id,
      title: song.title,
      trackNumber: song.trackNumber,
      lyrics: song.lyrics,
      tabsUrl: song.tabsUrl,
      stemsUrl: song.stemsUrl,
      duration: song.duration
    },
    album: album ? {
      id: album.id,
      title: album.title,
      artist: album.artist,
      coverHash: album.coverHash,
      year: album.year
    } : null,
    tracks: tracks.map(track => ({
      id: track.id,
      name: track.name,
      fileHash: track.fileHash,
      sortOrder: track.sortOrder,
      color: track.color
    }))
  }
})
