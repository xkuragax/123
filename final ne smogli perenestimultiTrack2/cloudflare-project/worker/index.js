// Cloudflare Worker - API для Multitrack Player
// Работает с D1 (SQLite) и R2 (файловое хранилище)

import { Router } from './router.js';

// Создаем роутер
const router = new Router();

// ========== CORS Headers ==========
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ========== Utility Functions ==========
function generateId() {
  return crypto.randomUUID();
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

function errorResponse(message, status = 500) {
  return jsonResponse({ error: message }, status);
}

// Проверка авторизации админа
function checkAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice(7);
  return token === env.ADMIN_TOKEN || token === env.ADMIN_PASSWORD;
}

// ========== PUBLIC API ==========

// Получить все альбомы
router.get('/api/albums', async (request, env) => {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM albums ORDER BY sort_order ASC, year DESC'
    ).all();
    return jsonResponse(results || []);
  } catch (err) {
    return errorResponse(err.message);
  }
});

// Получить альбом по ID
router.get('/api/albums/:id', async (request, env, params) => {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM albums WHERE id = ?'
    ).bind(params.id).all();
    
    if (!results || results.length === 0) {
      return errorResponse('Album not found', 404);
    }
    
    return jsonResponse(results[0]);
  } catch (err) {
    return errorResponse(err.message);
  }
});

// Получить песни альбома
router.get('/api/albums/:id/songs', async (request, env, params) => {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM songs WHERE album_id = ? ORDER BY track_number ASC'
    ).bind(params.id).all();
    
    const songs = results || [];
    
    // Добавляем количество треков для каждой песни
    const songsWithCount = await Promise.all(
      songs.map(async (song) => {
        const { results: countResult } = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM tracks WHERE song_id = ?'
        ).bind(song.id).all();
        return {
          ...song,
          tracks_count: countResult?.[0]?.count || 0
        };
      })
    );
    
    return jsonResponse(songsWithCount);
  } catch (err) {
    return errorResponse(err.message);
  }
});

// Получить песню по ID
router.get('/api/songs/:id', async (request, env, params) => {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM songs WHERE id = ?'
    ).bind(params.id).all();
    
    if (!results || results.length === 0) {
      return errorResponse('Song not found', 404);
    }
    
    return jsonResponse(results[0]);
  } catch (err) {
    return errorResponse(err.message);
  }
});

// Получить треки песни
router.get('/api/songs/:id/tracks', async (request, env, params) => {
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM tracks WHERE song_id = ? ORDER BY sort_order ASC'
    ).bind(params.id).all();
    
    // Добавляем URL для файлов
    const tracksWithUrls = (results || []).map(track => ({
      ...track,
      file_url: `https://${env.FILES.bucketName}.${request.headers.get('host')}/files/${track.file_hash}`
    }));
    
    return jsonResponse(tracksWithUrls);
  } catch (err) {
    return errorResponse(err.message);
  }
});

// Получить полную информацию о песне для плеера
router.get('/api/songs/:id/public', async (request, env, params) => {
  try {
    // Получаем песню
    const { results: songResults } = await env.DB.prepare(
      'SELECT * FROM songs WHERE id = ?'
    ).bind(params.id).all();
    
    if (!songResults || songResults.length === 0) {
      return errorResponse('Song not found', 404);
    }
    
    const song = songResults[0];
    
    // Получаем альбом
    const { results: albumResults } = await env.DB.prepare(
      'SELECT * FROM albums WHERE id = ?'
    ).bind(song.album_id).all();
    
    const album = albumResults?.[0] || null;
    
    // Получаем треки
    const { results: trackResults } = await env.DB.prepare(
      'SELECT * FROM tracks WHERE song_id = ? ORDER BY sort_order ASC'
    ).bind(params.id).all();
    
    const tracks = (trackResults || []).map(track => ({
      id: track.id,
      name: track.name,
      file_hash: track.file_hash,
      file_url: `https://${request.headers.get('host')}/api/files/${track.file_hash}`,
      sort_order: track.sort_order,
      color: track.color
    }));
    
    return jsonResponse({
      song: {
        id: song.id,
        title: song.title,
        track_number: song.track_number,
        lyrics: song.lyrics,
        chords: song.chords,
        tabs_url: song.tabs_url,
        duration: song.duration
      },
      album: album ? {
        id: album.id,
        title: album.title,
        artist: album.artist,
        cover_hash: album.cover_hash,
        year: album.year
      } : null,
      tracks
    });
  } catch (err) {
    return errorResponse(err.message);
  }
});

// Получить файл из R2
router.get('/api/files/:hash', async (request, env, params) => {
  try {
    const object = await env.FILES.get(`files/${params.hash}`);
    
    if (!object) {
      return errorResponse('File not found', 404);
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Access-Control-Allow-Origin', '*');
    
    return new Response(object.body, { headers });
  } catch (err) {
    return errorResponse(err.message);
  }
});

// ========== ADMIN API (требует авторизации) ==========

// Проверка пароля админа
router.post('/api/admin/verify', async (request, env) => {
  try {
    const { password } = await request.json();
    const isValid = password === env.ADMIN_PASSWORD || password === env.ADMIN_TOKEN;
    
    if (isValid) {
      return jsonResponse({ success: true });
    } else {
      return errorResponse('Invalid password', 401);
    }
  } catch (err) {
    return errorResponse(err.message);
  }
});

// Middleware для проверки авторизации
function requireAuth(handler) {
  return async (request, env, params) => {
    if (!checkAuth(request, env)) {
      return errorResponse('Unauthorized', 401);
    }
    return handler(request, env, params);
  };
}

// Получить URL для загрузки файла
router.post('/api/admin/upload-url', requireAuth(async (request, env) => {
  try {
    const { filename, contentType } = await request.json();
    const hash = generateId();
    const key = `files/${hash}`;
    
    // В Cloudflare Workers нет прямой генерации presigned URL
    // Файлы загружаются напрямую через API или фронтенд загружает в R2 через SDK
    
    return jsonResponse({
      hash,
      uploadUrl: `/api/admin/upload/${hash}`,
      publicUrl: `https://${request.headers.get('host')}/api/files/${hash}`
    });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Загрузить файл в R2
router.post('/api/admin/upload/:hash', requireAuth(async (request, env, params) => {
  try {
    const key = `files/${params.hash}`;
    const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
    
    await env.FILES.put(key, request.body, {
      httpMetadata: {
        contentType,
      },
    });
    
    return jsonResponse({
      success: true,
      hash: params.hash,
      url: `https://${request.headers.get('host')}/api/files/${params.hash}`
    });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Создать альбом
router.post('/api/admin/albums', requireAuth(async (request, env) => {
  try {
    const data = await request.json();
    const id = generateId();
    
    await env.DB.prepare(
      `INSERT INTO albums (id, title, artist, cover_hash, year, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.title,
      data.artist,
      data.cover_hash || null,
      data.year || null,
      data.sort_order || 0
    ).run();
    
    return jsonResponse({ id, ...data });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Обновить альбом
router.put('/api/admin/albums/:id', requireAuth(async (request, env, params) => {
  try {
    const data = await request.json();
    
    await env.DB.prepare(
      `UPDATE albums SET 
        title = COALESCE(?, title),
        artist = COALESCE(?, artist),
        cover_hash = COALESCE(?, cover_hash),
        year = COALESCE(?, year),
        sort_order = COALESCE(?, sort_order)
       WHERE id = ?`
    ).bind(
      data.title,
      data.artist,
      data.cover_hash,
      data.year,
      data.sort_order,
      params.id
    ).run();
    
    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Удалить альбом
router.delete('/api/admin/albums/:id', requireAuth(async (request, env, params) => {
  try {
    await env.DB.prepare('DELETE FROM albums WHERE id = ?').bind(params.id).run();
    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Создать песню
router.post('/api/admin/songs', requireAuth(async (request, env) => {
  try {
    const data = await request.json();
    const id = generateId();
    
    await env.DB.prepare(
      `INSERT INTO songs (id, album_id, title, track_number, lyrics, chords, tabs_url, duration) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.album_id,
      data.title,
      data.track_number || 0,
      data.lyrics || null,
      data.chords || null,
      data.tabs_url || null,
      data.duration || null
    ).run();
    
    return jsonResponse({ id, ...data });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Обновить песню
router.put('/api/admin/songs/:id', requireAuth(async (request, env, params) => {
  try {
    const data = await request.json();
    
    await env.DB.prepare(
      `UPDATE songs SET 
        title = COALESCE(?, title),
        track_number = COALESCE(?, track_number),
        lyrics = COALESCE(?, lyrics),
        chords = COALESCE(?, chords),
        tabs_url = COALESCE(?, tabs_url),
        duration = COALESCE(?, duration)
       WHERE id = ?`
    ).bind(
      data.title,
      data.track_number,
      data.lyrics,
      data.chords,
      data.tabs_url,
      data.duration,
      params.id
    ).run();
    
    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Удалить песню
router.delete('/api/admin/songs/:id', requireAuth(async (request, env, params) => {
  try {
    await env.DB.prepare('DELETE FROM songs WHERE id = ?').bind(params.id).run();
    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Создать трек
router.post('/api/admin/tracks', requireAuth(async (request, env) => {
  try {
    const data = await request.json();
    const id = generateId();
    
    await env.DB.prepare(
      `INSERT INTO tracks (id, song_id, name, file_hash, sort_order, color) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.song_id,
      data.name,
      data.file_hash,
      data.sort_order || 0,
      data.color || '#6366f1'
    ).run();
    
    return jsonResponse({ id, ...data });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Обновить трек
router.put('/api/admin/tracks/:id', requireAuth(async (request, env, params) => {
  try {
    const data = await request.json();
    
    await env.DB.prepare(
      `UPDATE tracks SET 
        name = COALESCE(?, name),
        sort_order = COALESCE(?, sort_order),
        color = COALESCE(?, color)
       WHERE id = ?`
    ).bind(
      data.name,
      data.sort_order,
      data.color,
      params.id
    ).run();
    
    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Удалить трек
router.delete('/api/admin/tracks/:id', requireAuth(async (request, env, params) => {
  try {
    await env.DB.prepare('DELETE FROM tracks WHERE id = ?').bind(params.id).run();
    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Изменить порядок альбомов
router.post('/api/admin/albums/reorder', requireAuth(async (request, env) => {
  try {
    const { orders } = await request.json();
    
    for (const { id, sort_order } of orders) {
      await env.DB.prepare(
        'UPDATE albums SET sort_order = ? WHERE id = ?'
      ).bind(sort_order, id).run();
    }
    
    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Изменить порядок песен
router.post('/api/admin/songs/reorder', requireAuth(async (request, env) => {
  try {
    const { orders } = await request.json();
    
    for (const { id, track_number } of orders) {
      await env.DB.prepare(
        'UPDATE songs SET track_number = ? WHERE id = ?'
      ).bind(track_number, id).run();
    }
    
    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// Изменить порядок треков
router.post('/api/admin/tracks/reorder', requireAuth(async (request, env) => {
  try {
    const { orders } = await request.json();
    
    for (const { id, sort_order } of orders) {
      await env.DB.prepare(
        'UPDATE tracks SET sort_order = ? WHERE id = ?'
      ).bind(sort_order, id).run();
    }
    
    return jsonResponse({ success: true });
  } catch (err) {
    return errorResponse(err.message);
  }
}));

// ========== OPTIONS для CORS ==========
router.options('*', () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
});

// ========== Export Worker Handler ==========
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Обработка CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    // Пробуем найти маршрут
    const response = await router.handle(request, env);
    if (response) {
      return response;
    }
    
    // Если маршрут не найден
    return errorResponse('Not found', 404);
  },
};
