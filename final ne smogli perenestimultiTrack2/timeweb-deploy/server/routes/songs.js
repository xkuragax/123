const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// Получить песни альбома
router.get('/by-album/:albumId', (req, res) => {
  try {
    const songs = db.prepare('SELECT * FROM songs WHERE album_id = ? ORDER BY track_number ASC').all(req.params.albumId);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить песню по ID
router.get('/:id', (req, res) => {
  try {
    const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать песню
router.post('/', (req, res) => {
  try {
    const { album_id, title, track_number, lyrics, chords, tabs_url, duration } = req.body;
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO songs (id, album_id, title, track_number, lyrics, chords, tabs_url, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, album_id, title, track_number || 0, lyrics || null, chords || null, tabs_url || null, duration || null);
    
    const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(id);
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить песню
router.put('/:id', (req, res) => {
  try {
    const { title, track_number, lyrics, chords, tabs_url, duration } = req.body;
    
    db.prepare(`
      UPDATE songs 
      SET title = ?, track_number = ?, lyrics = ?, chords = ?, tabs_url = ?, duration = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, track_number || 0, lyrics || null, chords || null, tabs_url || null, duration || null, req.params.id);
    
    const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить песню
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Изменить порядок песен
router.post('/reorder', (req, res) => {
  try {
    const { songIds } = req.body;
    const stmt = db.prepare('UPDATE songs SET track_number = ? WHERE id = ?');
    
    const updateMany = db.transaction((ids) => {
      ids.forEach((id, index) => {
        stmt.run(index + 1, id);
      });
    });
    
    updateMany(songIds);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
