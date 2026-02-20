const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// Получить все альбомы
router.get('/', (req, res) => {
  try {
    const albums = db.prepare('SELECT * FROM albums ORDER BY sort_order ASC, created_at DESC').all();
    res.json(albums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить альбом по ID
router.get('/:id', (req, res) => {
  try {
    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id);
    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать альбом
router.post('/', (req, res) => {
  try {
    const { title, artist, cover_hash, year } = req.body;
    const id = uuidv4();
    
    // Получаем максимальный sort_order
    const maxSort = db.prepare('SELECT MAX(sort_order) as max FROM albums').get();
    const sort_order = (maxSort && maxSort.max || 0) + 1;
    
    db.prepare(`
      INSERT INTO albums (id, title, artist, cover_hash, year, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, title, artist, cover_hash || null, year || null, sort_order);
    
    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(id);
    res.status(201).json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить альбом
router.put('/:id', (req, res) => {
  try {
    const { title, artist, cover_hash, year, sort_order } = req.body;
    
    db.prepare(`
      UPDATE albums 
      SET title = ?, artist = ?, cover_hash = ?, year = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, artist, cover_hash || null, year || null, sort_order || 0, req.params.id);
    
    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.id);
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить альбом
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM albums WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Изменить порядок альбомов
router.post('/reorder', (req, res) => {
  try {
    const { albumIds } = req.body;
    const stmt = db.prepare('UPDATE albums SET sort_order = ? WHERE id = ?');
    
    const updateMany = db.transaction((ids) => {
      ids.forEach((id, index) => {
        stmt.run(index + 1, id);
      });
    });
    
    updateMany(albumIds);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
