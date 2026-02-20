<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-8">Админ-панель</h1>
    
    <!-- Tabs -->
    <div class="flex gap-2 sm:gap-4 mb-4 sm:mb-8 border-b border-gray-700 overflow-x-auto">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['pb-3 sm:pb-4 px-2 sm:px-4 font-medium transition whitespace-nowrap text-sm sm:text-base', activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white']"
      >
        <i :class="['mr-1.5 sm:mr-2', tab.icon]"></i>{{ tab.name }}
      </button>
    </div>
    
    <!-- Albums Tab -->
    <div v-if="activeTab === 'albums'">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 class="text-lg sm:text-xl font-semibold text-white">Альбомы</h2>
        <button 
          @click="showAlbumModal = true" 
          class="w-full sm:w-auto bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg text-white font-medium text-sm sm:text-base transition"
        >
          <i class="fas fa-plus mr-2"></i>Добавить альбом
        </button>
      </div>
      
      <!-- Desktop Table -->
      <div class="hidden sm:block bg-dark-light rounded-xl overflow-hidden border border-gray-800">
        <table class="w-full">
          <thead class="bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-gray-400 text-sm">Обложка</th>
              <th class="px-4 py-3 text-left text-gray-400 text-sm">Название</th>
              <th class="px-4 py-3 text-left text-gray-400 text-sm">Исполнитель</th>
              <th class="px-4 py-3 text-left text-gray-400 text-sm">Год</th>
              <th class="px-4 py-3 text-left text-gray-400 text-sm">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="album in albums" :key="album.id" class="border-b border-gray-800 last:border-0">
              <td class="px-4 py-3">
                <div class="w-12 h-12 rounded bg-gray-700 overflow-hidden">
                  <img v-if="album.coverHash" :src="`https://fs.chatium.ru/thumbnail/${album.coverHash}/s/100x100`" class="w-full h-full object-cover">
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <i class="fas fa-image text-gray-600"></i>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-white">{{ album.title }}</td>
              <td class="px-4 py-3 text-gray-400">{{ album.artist }}</td>
              <td class="px-4 py-3 text-gray-400">{{ album.year || '-' }}</td>
              <td class="px-4 py-3">
                <button @click="editAlbum(album)" class="w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition mr-2">
                  <i class="fas fa-edit text-sm"></i>
                </button>
                <button @click="deleteAlbum(album.id)" class="w-9 h-9 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition">
                  <i class="fas fa-trash text-sm"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-3">
        <div 
          v-for="album in albums" 
          :key="album.id"
          class="bg-dark-light rounded-xl p-3 border border-gray-800 flex items-center gap-3"
        >
          <div class="w-16 h-16 rounded-lg bg-gray-700 overflow-hidden flex-shrink-0">
            <img v-if="album.coverHash" :src="`https://fs.chatium.ru/thumbnail/${album.coverHash}/s/100x100`" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center">
              <i class="fas fa-image text-gray-600"></i>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-white font-medium truncate">{{ album.title }}</h3>
            <p class="text-gray-400 text-sm truncate">{{ album.artist }}</p>
            <p v-if="album.year" class="text-gray-500 text-xs">{{ album.year }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <button @click="editAlbum(album)" class="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition flex items-center justify-center">
              <i class="fas fa-edit text-xs"></i>
            </button>
            <button @click="deleteAlbum(album.id)" class="w-8 h-8 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition flex items-center justify-center">
              <i class="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Songs Tab -->
    <div v-if="activeTab === 'songs'">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 class="text-lg sm:text-xl font-semibold text-white">Песни</h2>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <select 
            v-model="selectedAlbum" 
            class="w-full sm:w-auto bg-dark-light border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="">Все альбомы</option>
            <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.title }}</option>
          </select>
          <button 
            @click="showSongModal = true" 
            class="w-full sm:w-auto bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg text-white font-medium text-sm transition"
          >
            <i class="fas fa-plus mr-2"></i>Добавить
          </button>
        </div>
      </div>
      
      <!-- Desktop Table -->
      <div class="hidden sm:block bg-dark-light rounded-xl overflow-hidden border border-gray-800">
        <table class="w-full">
          <thead class="bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-gray-400 text-sm">#</th>
              <th class="px-4 py-3 text-left text-gray-400 text-sm">Название</th>
              <th class="px-4 py-3 text-left text-gray-400 text-sm">Альбом</th>
              <th class="px-4 py-3 text-left text-gray-400 text-sm">Длительность</th>
              <th class="px-4 py-3 text-left text-gray-400 text-sm">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="song in filteredSongs" :key="song.id" class="border-b border-gray-800 last:border-0">
              <td class="px-4 py-3 text-gray-400">{{ song.trackNumber }}</td>
              <td class="px-4 py-3 text-white">{{ song.title }}</td>
              <td class="px-4 py-3 text-gray-400">{{ getAlbumTitle(song.albumId) }}</td>
              <td class="px-4 py-3 text-gray-400">{{ formatDuration(song.duration) }}</td>
              <td class="px-4 py-3">
                <button @click="editSong(song)" class="w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition mr-2">
                  <i class="fas fa-edit text-sm"></i>
                </button>
                <button @click="deleteSong(song.id)" class="w-9 h-9 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition">
                  <i class="fas fa-trash text-sm"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-3">
        <div 
          v-for="song in filteredSongs" 
          :key="song.id"
          class="bg-dark-light rounded-xl p-3 border border-gray-800"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-gray-500 text-xs w-5">{{ song.trackNumber }}</span>
                <h3 class="text-white font-medium truncate">{{ song.title }}</h3>
              </div>
              <p class="text-gray-400 text-sm truncate ml-7">{{ getAlbumTitle(song.albumId) }}</p>
              <p class="text-gray-500 text-xs ml-7">{{ formatDuration(song.duration) }}</p>
            </div>
            <div class="flex gap-1">
              <button @click="editSong(song)" class="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition flex items-center justify-center">
                <i class="fas fa-edit text-xs"></i>
              </button>
              <button @click="deleteSong(song.id)" class="w-8 h-8 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition flex items-center justify-center">
                <i class="fas fa-trash text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tracks Tab -->
    <div v-if="activeTab === 'tracks'">
      <div class="text-center py-8 sm:py-12 text-gray-500 bg-dark-light rounded-xl border border-gray-800">
        <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-sliders-h text-gray-600 text-2xl"></i>
        </div>
        <p class="text-sm sm:text-base">Управление треками доступно на странице песни</p>
        <NuxtLink to="/" class="text-primary hover:underline mt-4 inline-block text-sm sm:text-base">Перейти к альбомам</NuxtLink>
      </div>
    </div>
    
    <!-- Album Modal -->
    <div v-if="showAlbumModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-dark-light rounded-xl p-4 sm:p-6 w-full max-w-md border border-gray-800">
        <h3 class="text-lg sm:text-xl font-bold text-white mb-4">{{ editingAlbum ? 'Редактировать' : 'Добавить' }} альбом</h3>
        <form @submit.prevent="saveAlbum">
          <div class="space-y-4">
            <div>
              <label class="block text-gray-400 mb-1 text-sm">Название</label>
              <input v-model="albumForm.title" type="text" class="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" required>
            </div>
            <div>
              <label class="block text-gray-400 mb-1 text-sm">Исполнитель</label>
              <input v-model="albumForm.artist" type="text" class="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" required>
            </div>
            <div>
              <label class="block text-gray-400 mb-1 text-sm">Год</label>
              <input v-model="albumForm.year" type="number" class="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" @click="showAlbumModal = false" class="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white text-sm transition">Отмена</button>
            <button type="submit" class="flex-1 bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg text-white text-sm transition">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const tabs = [
  { id: 'albums', name: 'Альбомы', icon: 'fas fa-compact-disc' },
  { id: 'songs', name: 'Песни', icon: 'fas fa-music' },
  { id: 'tracks', name: 'Треки', icon: 'fas fa-sliders-h' }
]

const activeTab = ref('albums')
const selectedAlbum = ref('')
const showAlbumModal = ref(false)
const showSongModal = ref(false)
const editingAlbum = ref(null)
const editingSong = ref(null)

const albumForm = reactive({
  title: '',
  artist: '',
  year: ''
})

const { data: albums, refresh: refreshAlbums } = await useFetch('/api/albums')
const { data: songs, refresh: refreshSongs } = await useFetch('/api/admin/songs')

const filteredSongs = computed(() => {
  if (!selectedAlbum.value) return songs.value || []
  return (songs.value || []).filter(s => s.albumId === selectedAlbum.value)
})

function getAlbumTitle(albumId) {
  return albums.value?.find(a => a.id === albumId)?.title || '-'
}

function formatDuration(seconds) {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function editAlbum(album) {
  editingAlbum.value = album
  albumForm.title = album.title
  albumForm.artist = album.artist
  albumForm.year = album.year || ''
  showAlbumModal.value = true
}

async function saveAlbum() {
  try {
    if (editingAlbum.value) {
      await $fetch(`/api/albums/${editingAlbum.value.id}`, { method: 'PUT', body: albumForm })
    } else {
      await $fetch('/api/albums', { method: 'POST', body: albumForm })
    }
    showAlbumModal.value = false
    refreshAlbums()
  } catch (e) {
    alert('Ошибка сохранения')
  }
}

async function deleteAlbum(id) {
  if (!confirm('Удалить альбом?')) return
  try {
    await $fetch(`/api/albums/${id}`, { method: 'DELETE' })
    refreshAlbums()
  } catch (e) {
    alert('Ошибка удаления')
  }
}

async function deleteSong(id) {
  if (!confirm('Удалить песню?')) return
  try {
    await $fetch(`/api/songs/${id}`, { method: 'DELETE' })
    refreshSongs()
  } catch (e) {
    alert('Ошибка удаления')
  }
}
</script>