// Скрипт инициализации базы данных
const db = require('../server/database');

console.log('✅ База данных инициализирована');
console.log('📁 Файл базы: data/multitrack.db');

// Добавляем тестовые данные если таблицы пустые
const albums = db.prepare('SELECT COUNT(*) as count FROM albums').get();

if (albums.count === 0) {
  console.log('📝 Добавляем демо-данные...');
  
  const { v4: uuidv4 } = require('uuid');
  
  // Демо альбом
  const albumId = uuidv4();
  db.prepare(`
    INSERT INTO albums (id, title, artist, year, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(albumId, 'Демо Альбом', 'Тестовый Исполнитель', 2024, 1);
  
  // Демо песня
  const songId = uuidv4();
  db.prepare(`
    INSERT INTO songs (id, album_id, title, track_number, duration)
    VALUES (?, ?, ?, ?, ?)
  `).run(songId, albumId, 'Тестовая песня', 1, 180);
  
  console.log('✅ Демо-данные добавлены');
  console.log(`   Альбом ID: ${albumId}`);
  console.log(`   Песня ID: ${songId}`);
} else {
  console.log(`📊 В базе ${albums.count} альбомов`);
}

console.log('');
console.log('🚀 Готово! Запустите сервер: npm start');
