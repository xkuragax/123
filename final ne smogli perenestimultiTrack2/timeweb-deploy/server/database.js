const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'multitrack.db');
const db = new Database(dbPath);

// Включаем WAL режим для лучшей производительности
db.pragma('journal_mode = WAL');

// Создаем таблицы
function initDatabase() {
  // Таблица альбомов
  db.exec(`
    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      cover_hash TEXT,
      year INTEGER,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица песен
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      album_id TEXT NOT NULL,
      title TEXT NOT NULL,
      track_number INTEGER DEFAULT 0,
      lyrics TEXT,
      chords TEXT,
      tabs_url TEXT,
      duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    )
  `);

  // Таблица треков (стемов)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL,
      name TEXT NOT NULL,
      file_hash TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      color TEXT DEFAULT '#3b82f6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    )
  `);

  // Индексы для быстрого поиска
  db.exec(`CREATE INDEX IF NOT EXISTS idx_songs_album ON songs(album_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tracks_song ON tracks(song_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_albums_sort ON albums(sort_order)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_songs_track ON songs(track_number)`);

  console.log('✅ База данных инициализирована');
}

initDatabase();

module.exports = db;
