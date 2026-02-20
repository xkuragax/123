const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { getFileUrl } = require('../storage');

// ============ ALBUMS ============

// GET /api/albums - List all albums
router.get('/albums', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM albums ORDER BY sort_order ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/albums/:id - Get album by ID
router.get('/albums/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM albums WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/albums/:id/songs - Get songs for album
router.get('/albums/:id/songs', async (req, res) => {
  try {
    const songsResult = await query(
      'SELECT * FROM songs WHERE album_id = $1 ORDER BY track_number ASC',
      [req.params.id]
    );
    
    // Add track count for each song
    const songsWithCount = await Promise.all(
      songsResult.rows.map(async (song) => {
        const countResult = await query(
          'SELECT COUNT(*) FROM tracks WHERE song_id = $1',
          [song.id]
        );
        return {
          ...song,
          tracks_count: parseInt(countResult.rows[0].count)
        };
      })
    );
    
    res.json(songsWithCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SONGS ============

// GET /api/songs/:id - Get song by ID
router.get('/songs/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM songs WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/songs/:id/tracks - Get tracks for song
router.get('/songs/:id/tracks', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM tracks WHERE song_id = $1 ORDER BY sort_order ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/songs/:id/public - Get song with album and tracks (for player)
router.get('/songs/:id/public', async (req, res) => {
  try {
    // Get song
    const songResult = await query(
      'SELECT * FROM songs WHERE id = $1',
      [req.params.id]
    );
    if (songResult.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }
    const song = songResult.rows[0];

    // Get album
    const albumResult = await query(
      'SELECT * FROM albums WHERE id = $1',
      [song.album_id]
    );
    const album = albumResult.rows[0] || null;

    // Get tracks
    const tracksResult = await query(
      'SELECT * FROM tracks WHERE song_id = $1 ORDER BY sort_order ASC',
      [req.params.id]
    );

    res.json({
      song: {
        id: song.id,
        title: song.title,
        track_number: song.track_number,
        lyrics: song.lyrics,
        tabs_url: song.tabs_url,
        stems_url: song.stems_url,
        duration: song.duration
      },
      album: album ? {
        id: album.id,
        title: album.title,
        artist: album.artist,
        cover_hash: album.cover_hash,
        year: album.year
      } : null,
      tracks: tracksResult.rows.map(track => ({
        id: track.id,
        name: track.name,
        file_hash: track.file_hash,
        file_url: getFileUrl(track.file_hash),
        sort_order: track.sort_order,
        color: track.color
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
