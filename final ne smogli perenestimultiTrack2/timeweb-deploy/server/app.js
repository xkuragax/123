const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Папка для загрузки файлов
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database
const db = require('./database');

// Роуты
const albumsRouter = require('./routes/albums');
const songsRouter = require('./routes/songs');
const tracksRouter = require('./routes/tracks');
const uploadRouter = require('./routes/upload');

app.use('/api/albums', albumsRouter);
app.use('/api/songs', songsRouter);
app.use('/api/tracks', tracksRouter);
app.use('/api/upload', uploadRouter);

// Алиасы для совместимости с фронтендом
app.get('/api/albums/:id/songs', (req, res) => {
  const songs = require('./database').prepare('SELECT * FROM songs WHERE album_id = ? ORDER BY track_number ASC').all(req.params.id);
  res.json(songs);
});

app.get('/api/songs/:id/tracks', (req, res) => {
  const tracks = require('./database').prepare('SELECT * FROM tracks WHERE song_id = ? ORDER BY sort_order ASC').all(req.params.id);
  res.json(tracks);
});

// Дополнительные роуты для совместимости с фронтендом
app.get('/api/songs', (req, res) => {
  const albumId = req.query.albumId;
  if (albumId) {
    const songs = db.prepare('SELECT * FROM songs WHERE album_id = ? ORDER BY track_number ASC').all(albumId);
    res.json(songs);
  } else {
    const songs = db.prepare('SELECT * FROM songs ORDER BY title ASC').all();
    res.json(songs);
  }
});

app.get('/api/tracks', (req, res) => {
  const songId = req.query.songId;
  if (songId) {
    const tracks = db.prepare('SELECT * FROM tracks WHERE song_id = ? ORDER BY sort_order ASC').all(songId);
    res.json(tracks);
  } else {
    const tracks = db.prepare('SELECT * FROM tracks ORDER BY name ASC').all();
    res.json(tracks);
  }
});

// Получить песню с данными альбома
app.get('/api/songs/:id', (req, res) => {
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

// Получить альбом по ID
app.get('/api/albums/:id', (req, res) => {
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

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Страница альбома
app.get('/album/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Страница плеера
app.get('/song/:songId', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Страница текстов
app.get('/lyrics/:songId', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Админка
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 Multitrack Player запущен на порту ${PORT}`);
  console.log(`📁 Загрузки: ${uploadsDir}`);
});
