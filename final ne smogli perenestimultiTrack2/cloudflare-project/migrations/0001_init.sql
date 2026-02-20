-- Создание таблиц для Multitrack Player

-- Альбомы
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_hash TEXT,
  year INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Песни
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
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- Треки (стемы)
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  song_id TEXT NOT NULL,
  name TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_songs_album ON songs(album_id);
CREATE INDEX IF NOT EXISTS idx_tracks_song ON tracks(song_id);
CREATE INDEX IF NOT EXISTS idx_albums_order ON albums(sort_order);
CREATE INDEX IF NOT EXISTS idx_songs_number ON songs(track_number);
CREATE INDEX IF NOT EXISTS idx_tracks_order ON tracks(sort_order);
