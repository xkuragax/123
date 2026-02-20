const { createApp, ref, computed } = Vue;
const { createRouter, createWebHistory, useRoute } = VueRouter;

// API client
const API_BASE = '';

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
  
  async reorderAlbums(albums) {
    const res = await fetch(`${API_BASE}/api/admin/albums/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ albums })
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
  
  async reorderSongs(songs) {
    const res = await fetch(`${API_BASE}/api/admin/songs/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ songs })
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
  
  async reorderTracks(tracks) {
    const res = await fetch(`${API_BASE}/api/admin/tracks/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({ tracks })
    });
    return res.json();
  },
  
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject(new Error('Upload failed'));
        }
      });
      
      xhr.addEventListener('error', () => reject(new Error('Network error')));
      
      xhr.open('POST', `${API_BASE}/api/admin/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('adminToken')}`);
      xhr.send(formData);
    });
  }
};

// Helper functions
function getThumbnailUrl(hash, width, height) {
  // For S3 storage, we use the direct URL
  // You can add image processing service here if needed
  return `${API_BASE}/api/files/${hash}`;
}

function formatDuration(seconds) {
  if (!seconds) return '—';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Store for auth
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

// Import components
import CatalogPage from './pages/CatalogPage.js';
import AlbumPage from './pages/AlbumPage.js';
import SongPage from './pages/SongPage.js';
import LyricsPage from './pages/LyricsPage.js';
import AdminPage from './pages/AdminPage.js';
import LoginPage from './pages/LoginPage.js';

// Routes
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

// Create app
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
app.config.globalProperties.$getThumbnailUrl = getThumbnailUrl;
app.config.globalProperties.$formatDuration = formatDuration;
app.config.globalProperties.$store = store;

app.mount('#app');
