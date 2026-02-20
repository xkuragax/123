#!/usr/bin/env node
/**
 * Import data from old database or JSON files
 * Usage: node scripts/import-data.js <path-to-data.json>
 */

const fs = require('fs');
const path = require('path');

// Default data structure
const defaultData = {
  albums: [],
  songs: [],
  tracks: []
};

async function main() {
  const dataPath = process.argv[2];
  
  if (!dataPath) {
    console.log('Usage: node scripts/import-data.js <path-to-data.json>');
    console.log('');
    console.log('Expected JSON format:');
    console.log(JSON.stringify({
      albums: [
        {
          id: "album-id-1",
          title: "Album Name",
          artist: "Artist Name",
          cover_hash: "file-hash",
          year: 2024,
          sort_order: 0
        }
      ],
      songs: [
        {
          id: "song-id-1",
          album_id: "album-id-1",
          title: "Song Name",
          track_number: 1,
          lyrics: "Song lyrics...",
          tabs_url: "https://...",
          duration: 180
        }
      ],
      tracks: [
        {
          id: "track-id-1",
          song_id: "song-id-1",
          name: "Bass",
          file_hash: "audio-file-hash",
          sort_order: 0,
          color: "#6366f1"
        }
      ]
    }, null, 2));
    process.exit(1);
  }

  if (!fs.existsSync(dataPath)) {
    console.error(`File not found: ${dataPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  console.log(`Found ${data.albums?.length || 0} albums`);
  console.log(`Found ${data.songs?.length || 0} songs`);
  console.log(`Found ${data.tracks?.length || 0} tracks`);
  
  // Generate SQL insert statements
  const sql = [];
  
  // Insert albums
  if (data.albums?.length > 0) {
    sql.push('-- Albums');
    for (const album of data.albums) {
      sql.push(`INSERT OR REPLACE INTO albums (id, title, artist, cover_hash, year, sort_order) VALUES (
        '${album.id}',
        '${album.title?.replace(/'/g, "''")}',
        '${album.artist?.replace(/'/g, "''")}',
        ${album.cover_hash ? `'${album.cover_hash}'` : 'NULL'},
        ${album.year || 'NULL'},
        ${album.sort_order || 0}
      );`);
    }
  }
  
  // Insert songs
  if (data.songs?.length > 0) {
    sql.push('\n-- Songs');
    for (const song of data.songs) {
      sql.push(`INSERT OR REPLACE INTO songs (id, album_id, title, track_number, lyrics, chords, tabs_url, duration) VALUES (
        '${song.id}',
        '${song.album_id}',
        '${song.title?.replace(/'/g, "''")}',
        ${song.track_number || 0},
        ${song.lyrics ? `'${song.lyrics.replace(/'/g, "''")}'` : 'NULL'},
        ${song.chords ? `'${song.chords.replace(/'/g, "''")}'` : 'NULL'},
        ${song.tabs_url ? `'${song.tabs_url}'` : 'NULL'},
        ${song.duration || 'NULL'}
      );`);
    }
  }
  
  // Insert tracks
  if (data.tracks?.length > 0) {
    sql.push('\n-- Tracks');
    for (const track of data.tracks) {
      sql.push(`INSERT OR REPLACE INTO tracks (id, song_id, name, file_hash, sort_order, color) VALUES (
        '${track.id}',
        '${track.song_id}',
        '${track.name?.replace(/'/g, "''")}',
        '${track.file_hash}',
        ${track.sort_order || 0},
        '${track.color || '#6366f1'}'
      );`);
    }
  }
  
  const outputPath = path.join(__dirname, '..', 'data', 'import.sql');
  fs.writeFileSync(outputPath, sql.join('\n'));
  
  console.log('');
  console.log('✅ SQL file generated: data/import.sql');
  console.log('');
  console.log('To import this data, run:');
  console.log(`  npx wrangler d1 execute multitrack-db --file=${outputPath}`);
}

main().catch(console.error);
