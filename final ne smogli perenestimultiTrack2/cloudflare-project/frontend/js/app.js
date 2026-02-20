const { createApp, ref, computed } = Vue;
const { createRouter, createWebHistory, useRoute } = VueRouter;

// ============================================
// API Configuration - Cloudflare Worker
// ============================================
// Для Cloudflare Pages API находится на том же домене
// В режиме разработки используется localhost:8787
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8787' : '';

// ============================================
// API Client
// ============================================
const api = {
  // Public API
  async getAlbums() {
    const res = await fetch(`${API_BASE}/api/albums`);
    return res.json();
  },
  
  async getAlbum(id) {
    const res = await fetch(`${API_BASE}/api/albums/${id}`);
    return res.json();
  },
  
  async getSongsByAlbum(albumId) {
    const res = await fetch(`${API_BASE}/api/albums/${albumId}/songs`);
    return res.json();
  },
  
  async getSong(id) {
    const res = await fetch(`${API_BASE}/api/songs/${id}/public`);
    return res.json();
  },
  
  async getTracksBySong(songId) {
    const res = await fetch(`${API_BASE}/api/songs/${songId}/tracks`);
    return res.json();
  },
  
  // Admin API
  async verifyAdmin(password) {
    // Для Cloudflare используем простую проверку по паролю
    // В реальном приложении здесь должен быть JWT
    const res = await fetch(`${API_BASE}/api/admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return res.ok;
  },
  
  async createAlbum(data) {
    const res = await fetch(`${API_BASE}/api/admin/albums`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async updateAlbum(id, data) {
    const res = await fetch(`${API_BASE}/api/admin/albums/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async deleteAlbum(id) {
    const res = await fetch(`${API_BASE}/api/admin/albums/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return res.json();
  },
  
  async reorderAlbums(orders) {
    const res = await fetch(`${API_BASE}/api/admin/albums/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ orders })
    });
    return res.json();
  },
  
  async createSong(data) {
    const res = await fetch(`${API_BASE}/api/admin/songs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async updateSong(id, data) {
    const res = await fetch(`${API_BASE}/api/admin/songs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async deleteSong(id) {
    const res = await fetch(`${API_BASE}/api/admin/songs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return res.json();
  },
  
  async reorderSongs(orders) {
    const res = await fetch(`${API_BASE}/api/admin/songs/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ orders })
    });
    return res.json();
  },
  
  async createTrack(data) {
    const res = await fetch(`${API_BASE}/api/admin/tracks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async updateTrack(id, data) {
    const res = await fetch(`${API_BASE}/api/admin/tracks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  async deleteTrack(id) {
    const res = await fetch(`${API_BASE}/api/admin/tracks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    return res.json();
  },
  
  async reorderTracks(orders) {
    const res = await fetch(`${API_BASE}/api/admin/tracks/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ orders })
    });
    return res.json();
  },
  
  // Загрузка файла через API
  async uploadFile(file, onProgress) {
    // Получаем URL для загрузки
    const urlRes = await fetch(`${API_BASE}/api/admin/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type
      })
    });
    
    const { hash, uploadUrl } = await urlRes.json();
    
    // Загружаем файл
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve({ hash, url: `${API_BASE}/api/files/${hash}` });
        } else {
          reject(new Error('Upload failed'));
        }
      });
      
      xhr.addEventListener('error', () => reject(new Error('Network error')));
      
      xhr.open('POST', `${API_BASE}${uploadUrl}`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('adminToken')}`);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }
};

// ============================================
// Helper Functions
// ============================================
function getFileUrl(hash) {
  if (!hash) return '';
  return `${API_BASE}/api/files/${hash}`;
}

function formatDuration(seconds) {
  if (!seconds) return '—';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// Auth Store
// ============================================
const store = {
  isAuthenticated: ref(!!localStorage.getItem('adminToken')),
  
  login(password) {
    localStorage.setItem('adminToken', password);
    this.isAuthenticated.value = true;
  },
  
  logout() {
    localStorage.removeItem('adminToken');
    this.isAuthenticated.value = false;
  }
};

// ============================================
// Import Components
// ============================================
import CatalogPage from './pages/CatalogPage.js';
import AlbumPage from './pages/AlbumPage.js';
import SongPage from './pages/SongPage.js';
import LyricsPage from './pages/LyricsPage.js';
import AdminPage from './pages/AdminPage.js';
import LoginPage from './pages/LoginPage.js';

// ============================================
// Routes
// ============================================
const routes = [
  { path: '/', component: CatalogPage },
  { path: '/album/:id', component: AlbumPage, props: true },
  { path: '/song/:songId', component: SongPage, props: true },
  { path: '/lyrics/:songId', component: LyricsPage, props: true },
  { path: '/admin', component: AdminPage },
  { path: '/login', component: LoginPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// ============================================
// Create App
// ============================================
const app = createApp({
  setup() {
    return { store };
  },
  template: `
    <router-view></router-view>
  `
});

app.use(router);
app.config.globalProperties.$api = api;
app.config.globalProperties.$getFileUrl = getFileUrl;
app.config.globalProperties.$formatDuration = formatDuration;
app.config.globalProperties.$store = store;

app.mount('#app');
