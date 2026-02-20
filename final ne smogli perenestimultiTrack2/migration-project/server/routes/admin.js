const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db');
const { uploadFile, deleteFile } = require('../storage');

const upload = multer({ storage: multer.memoryStorage() });

// Simple auth middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// POST /api/admin/verify - Verify password (no auth required)
router.post('/verify', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Apply auth to all routes below
router.use(requireAuth);

// ============ ALBUMS ADMIN ============

// POST /api/admin/albums - Create album
router.post('/albums', async (req, res) => {
  try {
    const { title, artist, year, cover_hash, sort_order } = req.body;
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO albums (id, title, artist, year, cover_hash, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [id, title, artist, year, cover_hash, sort_order]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/albums/:id - Update album
router.put('/albums/:id', async (req, res) => {
  try {
    const { title, artist, year, cover_hash, sort_order } = req.body;
    
    const result = await query(
      `UPDATE albums 
       SET title = $1, artist = $2, year = $3, cover_hash = $4, sort_order = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, artist, year, cover_hash, sort_order, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Album not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/albums/:id - Delete album with all songs and tracks
router.delete('/albums/:id', async (req, res) => {
  try {
    // Get all songs in album
    const songsResult = await query(
      'SELECT id FROM songs WHERE album_id = $1',
      [req.params.id]
    );
    
    // Delete tracks for each song
    for (const song of songsResult.rows) {
      const tracksResult = await query(
        'SELECT file_hash FROM tracks WHERE song_id = $1',
        [song.id]
      );
      
      // Delete files from storage
      for (const track of tracksResult.rows) {
        if (track.file_hash) {
          try {
            await deleteFile(track.file_hash);
          } catch (e) {
            console.error('Failed to delete file:', e);
          }
        }
      }
      
      await query('DELETE FROM tracks WHERE song_id = $1', [song.id]);
    }
    
    // Delete songs
    await query('DELETE FROM songs WHERE album_id = $1', [req.params.id]);
    
    // Delete album cover if exists
    const albumResult = await query(
      'SELECT cover_hash FROM albums WHERE id = $1',
      [req.params.id]
    );
    if (albumResult.rows[0]?.cover_hash) {
      try {
        await deleteFile(albumResult.rows[0].cover_hash);
      } catch (e) {
        console.error('Failed to delete cover:', e);
      }
    }
    
    // Delete album
    await query('DELETE FROM albums WHERE id = $1', [req.params.id]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/albums/reorder - Reorder albums
router.post('/albums/reorder', async (req, res) => {
  try {
    const { albums } = req.body;
    
    await Promise.all(
      albums.map((album, index) =>
        query('UPDATE albums SET sort_order = $1 WHERE id = $2', [index, album.id])
      )
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SONGS ADMIN ============

// POST /api/admin/songs - Create song
router.post('/songs', async (req, res) => {
  try {
    const { album_id, title, track_number, lyrics, tabs_url, stems_url, duration } = req.body;
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO songs (id, album_id, title, track_number, lyrics, tabs_url, stems_url, duration, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [id, album_id, title, track_number, lyrics, tabs_url, stems_url, duration]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/songs/:id - Update song
router.put('/songs/:id', async (req, res) => {
  try {
    const { title, track_number, lyrics, tabs_url, stems_url, duration } = req.body;
    
    const result = await query(
      `UPDATE songs 
       SET title = $1, track_number = $2, lyrics = $3, tabs_url = $4, stems_url = $5, duration = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, track_number, lyrics, tabs_url, stems_url, duration, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/songs/:id - Delete song with tracks
router.delete('/songs/:id', async (req, res) => {
  try {
    // Get tracks
    const tracksResult = await query(
      'SELECT file_hash FROM tracks WHERE song_id = $1',
      [req.params.id]
    );
    
    // Delete files from storage
    for (const track of tracksResult.rows) {
      if (track.file_hash) {
        try {
          await deleteFile(track.file_hash);
        } catch (e) {
          console.error('Failed to delete file:', e);
        }
      }
    }
    
    // Delete tracks
    await query('DELETE FROM tracks WHERE song_id = $1', [req.params.id]);
    
    // Delete song
    await query('DELETE FROM songs WHERE id = $1', [req.params.id]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/songs/reorder - Reorder songs
router.post('/songs/reorder', async (req, res) => {
  try {
    const { songs } = req.body;
    
    await Promise.all(
      songs.map((song, index) =>
        query('UPDATE songs SET track_number = $1 WHERE id = $2', [index + 1, song.id])
      )
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ TRACKS ADMIN ============

// POST /api/admin/tracks - Create track
router.post('/tracks', async (req, res) => {
  try {
    const { song_id, name, file_hash, sort_order, color } = req.body;
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO tracks (id, song_id, name, file_hash, sort_order, color, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [id, song_id, name, file_hash, sort_order, color]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/tracks/:id - Update track
router.put('/tracks/:id', async (req, res) => {
  try {
    const { name, file_hash, sort_order, color } = req.body;
    
    const result = await query(
      `UPDATE tracks 
       SET name = $1, file_hash = $2, sort_order = $3, color = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, file_hash, sort_order, color, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/tracks/:id - Delete track
router.delete('/tracks/:id', async (req, res) => {
  try {
    // Get file hash
    const trackResult = await query(
      'SELECT file_hash FROM tracks WHERE id = $1',
      [req.params.id]
    );
    
    // Delete file from storage
    if (trackResult.rows[0]?.file_hash) {
      try {
        await deleteFile(trackResult.rows[0].file_hash);
      } catch (e) {
        console.error('Failed to delete file:', e);
      }
    }
    
    // Delete track
    await query('DELETE FROM tracks WHERE id = $1', [req.params.id]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/tracks/reorder - Reorder tracks
router.post('/tracks/reorder', async (req, res) => {
  try {
    const { tracks } = req.body;
    
    await Promise.all(
      tracks.map((track, index) =>
        query('UPDATE tracks SET sort_order = $1 WHERE id = $2', [index, track.id])
      )
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ FILE UPLOAD ============

// POST /api/admin/upload - Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const key = `${uuidv4()}-${req.file.originalname}`;
    const url = await uploadFile(req.file.buffer, key, req.file.mimetype);
    
    res.json({
      hash: key,
      url: url
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
