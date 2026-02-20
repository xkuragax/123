const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// Получить треки песни
router.get('/by-song/:songId', (req, res) => {
  try {
    const tracks = db.prepare('SELECT * FROM tracks WHERE song_id = ? ORDER BY sort_order ASC').all(req.params.songId);
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать трек
router.post('/', (req, res) => {
  try {
    const { song_id, name, file_hash, color } = req.body;
    const id = uuidv4();
    
    // Получаем максимальный sort_order
    const maxSort = db.prepare('SELECT MAX(sort_order) as max FROM tracks WHERE song_id = ?').get(song_id);
    const sort_order = (maxSort && maxSort.max || 0) + 1;
    
    db.prepare(`
      INSERT INTO tracks (id, song_id, name, file_hash, sort_order, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, song_id, name, file_hash, sort_order, color || '#3b82f6');
    
    const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(id);
    res.status(201).json(track);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить трек
router.put('/:id', (req, res) => {
  try {
    const { name, file_hash, color, sort_order } = req.body;
    
    db.prepare(`
      UPDATE tracks 
      SET name = ?, file_hash = ?, color = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, file_hash, color || '#3b82f6', sort_order || 0, req.params.id);
    
    const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.id);
    res.json(track);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить трек
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tracks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Публичный endpoint для плеера (получить песню с треками)
router.get('/public/song/:songId', (req, res) => {
  try {
    const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    
    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(song.album_id);
    const tracks = db.prepare('SELECT * FROM tracks WHERE song_id = ? ORDER BY sort_order ASC').all(req.params.songId);
    
    res.json({
      song,
      album,
      tracks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
