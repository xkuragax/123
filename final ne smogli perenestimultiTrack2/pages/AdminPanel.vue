<template>
  <div class="min-h-screen bg-darker text-text-primary">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="mb-8 flex items-center space-x-4">
        <button v-if="currentView !== 'albums'" @click="goBack" class="text-accent hover:text-accent-hover">
          <i class="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 class="text-3xl font-bold">
          {{ viewTitle }}
        </h1>
      </div>

      <div v-if="currentView === 'albums'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold">Albums</h2>
          <button @click="openAlbumModal()" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>Add Album
          </button>
        </div>
        
        <div ref="albumsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="album in albums" 
            :key="album.id" 
            :data-id="album.id"
            class="card cursor-move"
            draggable="true"
            @dragstart="handleDragStart($event, album.id)"
            @dragover="handleDragOver"
            @drop="handleDrop($event, album.id, 'albums')"
            @dragend="handleDragEnd"
          >
            <div @click="openAlbum(album)" class="cursor-pointer">
              <img v-if="album.coverHash" :src="getThumbnailUrl(album.coverHash, 400, 400)" class="w-full h-48 object-cover rounded-t-lg" />
              <div v-else class="w-full h-48 bg-dark rounded-t-lg flex items-center justify-center">
                <i class="fas fa-image text-4xl text-muted"></i>
              </div>
              <div class="p-4">
                <h3 class="text-lg font-semibold">{{ album.title }}</h3>
                <p class="text-text-secondary">{{ album.artist }}</p>
                <p class="text-sm text-muted">{{ album.year }}</p>
              </div>
            </div>
            <div class="flex space-x-2 p-4 pt-0">
              <button @click.stop="openAlbumModal(album)" class="btn-secondary flex-1">
                <i class="fas fa-edit"></i>
              </button>
              <button @click.stop="deleteAlbum(album.id)" class="btn-danger flex-1">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentView === 'songs'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold">Songs</h2>
          <button @click="openSongModal()" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>Add Song
          </button>
        </div>

        <div ref="songsContainer" class="space-y-4">
          <div 
            v-for="song in songs" 
            :key="song.id"
            :data-id="song.id"
            class="card p-4 cursor-move"
            draggable="true"
            @dragstart="handleDragStart($event, song.id)"
            @dragover="handleDragOver"
            @drop="handleDrop($event, song.id, 'songs')"
            @dragend="handleDragEnd"
          >
            <div @click="openSong(song)" class="flex justify-between items-start cursor-pointer">
              <div class="flex-1">
                <h3 class="text-lg font-semibold">{{ song.title }}</h3>
                <div class="flex space-x-4 mt-2">
                  <span v-if="song.lyrics" class="text-accent hover:text-accent-hover text-sm">
                    <i class="fas fa-align-left mr-1"></i>Lyrics
                  </span>
                  <a v-if="song.tabsUrl" :href="song.tabsUrl" target="_blank" class="text-accent hover:text-accent-hover text-sm" @click.stop>
                    <i class="fas fa-file-alt mr-1"></i>Tabs
                  </a>
                  <a v-if="song.stemsUrl" :href="song.stemsUrl" target="_blank" class="text-accent hover:text-accent-hover text-sm" @click.stop>
                    <i class="fas fa-download mr-1"></i>Stems
                  </a>
                  <span v-if="song.tracksCount > 0" class="text-green-500 text-sm">
                    <i class="fas fa-music mr-1"></i>{{ song.tracksCount }} stems
                  </span>
                  <span v-else class="text-red-500 text-sm">
                    <i class="fas fa-exclamation-circle mr-1"></i>no stems
                  </span>
                </div>
              </div>
              <div class="flex space-x-2 ml-4">
                <button @click.stop="openSongModal(song)" class="btn-secondary">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click.stop="deleteSong(song.id)" class="btn-danger">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentView === 'tracks'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold">Tracks (Stems)</h2>
          <button @click="openTrackModal()" class="btn-primary" :disabled="tracks.length >= 7">
            <i class="fas fa-plus mr-2"></i>Add Track
          </button>
        </div>

        <div v-if="tracks.length >= 7" class="bg-accent/10 border border-accent text-text-primary p-3 rounded-lg mb-4">
          <i class="fas fa-info-circle mr-2"></i>Maximum 7 tracks per song reached
        </div>

        <div ref="tracksContainer" class="space-y-4">
          <div 
            v-for="track in tracks" 
            :key="track.id"
            :data-id="track.id"
            class="card p-4 cursor-move"
            draggable="true"
            @dragstart="handleDragStart($event, track.id)"
            @dragover="handleDragOver"
            @drop="handleDrop($event, track.id, 'tracks')"
            @dragend="handleDragEnd"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-4 flex-1">
                <div class="w-12 h-12 rounded" :style="{ backgroundColor: track.color || '#6366f1' }"></div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold">{{ track.name }}</h3>
                  <audio v-if="track.fileHash" :src="getFileUrl(track.fileHash)" controls class="mt-2 w-full max-w-md"></audio>
                </div>
              </div>
              <div class="flex space-x-2 ml-4">
                <button @click.stop="openTrackModal(track)" class="btn-secondary">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click.stop="deleteTrack(track.id)" class="btn-danger">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAlbumModal" class="modal-overlay" @click="closeAlbumModal">
      <div class="modal-content" @click.stop>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">{{ editingAlbum ? 'Edit Album' : 'Add Album' }}</h3>
          <button @click="closeAlbumModal" class="text-text-secondary hover:text-text-primary">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Title</label>
            <input v-model="albumForm.title" type="text" class="input-field" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Artist</label>
            <input v-model="albumForm.artist" type="text" class="input-field" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Year</label>
            <input v-model="albumForm.year" type="number" class="input-field" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Cover Image</label>
            <div v-if="albumForm.coverHash" class="mb-2">
              <img :src="getThumbnailUrl(albumForm.coverHash, 200, 200)" class="w-32 h-32 object-cover rounded" />
            </div>
            <input type="file" @change="handleAlbumCoverUpload" accept="image/*" class="input-field" />
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
              <div class="w-full bg-dark rounded-full h-2">
                <div class="bg-accent h-2 rounded-full" :style="{ width: uploadProgress + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button @click="saveAlbum" class="btn-primary flex-1" :disabled="isSaving">
            <i class="fas fa-save mr-2"></i>{{ isSaving ? 'Saving...' : 'Save' }}
          </button>
          <button @click="closeAlbumModal" class="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSongModal" class="modal-overlay" @click="closeSongModal">
      <div class="modal-content" @click.stop>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">{{ editingSong ? 'Edit Song' : 'Add Song' }}</h3>
          <button @click="closeSongModal" class="text-text-secondary hover:text-text-primary">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Title</label>
            <input v-model="songForm.title" type="text" class="input-field" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Lyrics</label>
            <textarea v-model="songForm.lyrics" rows="6" class="input-field"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Tabs URL (Google Drive)</label>
            <input v-model="songForm.tabsUrl" type="url" class="input-field" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Stems URL (Google Drive)</label>
            <input v-model="songForm.stemsUrl" type="url" class="input-field" />
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button @click="saveSong" class="btn-primary flex-1" :disabled="isSaving">
            <i class="fas fa-save mr-2"></i>{{ isSaving ? 'Saving...' : 'Save' }}
          </button>
          <button @click="closeSongModal" class="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div v-if="showTrackModal" class="modal-overlay" @click="closeTrackModal">
      <div class="modal-content" @click.stop>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">{{ editingTrack ? 'Edit Track' : 'Add Tracks' }}</h3>
          <button @click="closeTrackModal" class="text-text-secondary hover:text-text-primary">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div v-if="editingTrack">
            <label class="block text-sm font-medium mb-2">Name</label>
            <input v-model="trackForm.name" type="text" class="input-field" placeholder="e.g., Bass, Vocals, Guitar..." />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">{{ editingTrack ? 'Audio File' : 'Audio Files (select multiple)' }}</label>
            <div v-if="editingTrack && trackForm.fileHash" class="mb-2">
              <audio :src="getFileUrl(trackForm.fileHash)" controls class="w-full"></audio>
            </div>
            <input 
              type="file" 
              @change="handleTrackFileUpload" 
              accept="audio/*" 
              :multiple="!editingTrack"
              class="input-field" 
            />
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
              <div class="w-full bg-dark rounded-full h-2">
                <div class="bg-accent h-2 rounded-full" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <p class="text-sm text-text-secondary mt-1 text-center">Uploading... {{ uploadProgress }}%</p>
            </div>
            <div v-if="uploadingFiles.length > 0" class="mt-3 space-y-2">
              <div v-for="(file, idx) in uploadingFiles" :key="idx" class="text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-text-secondary">{{ file.name }}</span>
                  <span class="text-accent">{{ file.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button @click="saveTrack" class="btn-primary flex-1" :disabled="isSaving">
            <i class="fas fa-save mr-2"></i>{{ isSaving ? 'Saving...' : 'Save' }}
          </button>
          <button @click="closeTrackModal" class="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getThumbnailUrl, obtainStorageFilePutUrl } from '@app/storage'
import {
  apiAlbumsListRoute,
  apiAlbumsCreateRoute,
  apiAlbumsUpdateRoute,
  apiAlbumsDeleteRoute,
  apiSongsByAlbumRoute,
  apiSongsCreateRoute,
  apiSongsUpdateRoute,
  apiSongsDeleteRoute,
  apiTracksBySongRoute,
  apiTracksCreateRoute,
  apiTracksUpdateRoute,
  apiTracksDeleteRoute,
  apiReorderAlbumsRoute,
  apiReorderSongsRoute,
  apiReorderTracksRoute
} from '../api/albums'

const currentView = ref('albums')
const albums = ref([])
const songs = ref([])
const tracks = ref([])

const currentAlbum = ref(null)
const currentSong = ref(null)

const showAlbumModal = ref(false)
const showSongModal = ref(false)
const showTrackModal = ref(false)

const editingAlbum = ref(null)
const editingSong = ref(null)
const editingTrack = ref(null)

const isSaving = ref(false)
const uploadProgress = ref(0)
const uploadingFiles = ref([])
const uploadedTracks = ref([])

const draggedItemId = ref(null)

const albumsContainer = ref(null)
const songsContainer = ref(null)
const tracksContainer = ref(null)

const viewTitle = computed(() => {
  if (currentView.value === 'albums') return 'Admin Panel'
  if (currentView.value === 'songs') return `${currentAlbum.value?.artist} - ${currentAlbum.value?.title}`
  if (currentView.value === 'tracks') return currentSong.value?.title
  return 'Admin Panel'
})

const albumForm = ref({
  title: '',
  artist: '',
  year: new Date().getFullYear(),
  coverHash: ''
})

const songForm = ref({
  title: '',
  lyrics: '',
  tabsUrl: '',
  stemsUrl: ''
})

const trackForm = ref({
  name: '',
  fileHash: '',
  color: '#6366f1'
})

const getFileUrl = (hash) => {
  return `https://storage.msk.chatium.io/1/${hash}`
}

const getRandomColor = () => {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
    '#f97316', '#eab308', '#84cc16', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#a855f7'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const loadAlbums = async () => {
  albums.value = await apiAlbumsListRoute.run(ctx)
}

const loadSongs = async (albumId) => {
  songs.value = await apiSongsByAlbumRoute({ albumId }).run(ctx)
}

const loadTracks = async (songId) => {
  tracks.value = await apiTracksBySongRoute({ songId }).run(ctx)
}

const openAlbum = (album) => {
  currentAlbum.value = album
  currentView.value = 'songs'
  loadSongs(album.id)
}

const openSong = (song) => {
  currentSong.value = song
  currentView.value = 'tracks'
  loadTracks(song.id)
}

const goBack = async () => {
  if (currentView.value === 'tracks') {
    await loadSongs(currentAlbum.value.id)
    currentView.value = 'songs'
    currentSong.value = null
  } else if (currentView.value === 'songs') {
    currentView.value = 'albums'
    currentAlbum.value = null
  }
}

const handleDragStart = (event, itemId) => {
  draggedItemId.value = itemId
  event.target.classList.add('dragging')
}

const handleDragOver = (event) => {
  event.preventDefault()
}

const handleDrop = async (event, targetId, listType) => {
  event.preventDefault()
  
  const draggedId = draggedItemId.value
  if (draggedId === targetId) return

  let list
  let reorderRoute
  
  if (listType === 'albums') {
    list = albums.value
    reorderRoute = apiReorderAlbumsRoute
  } else if (listType === 'songs') {
    list = songs.value
    reorderRoute = apiReorderSongsRoute
  } else if (listType === 'tracks') {
    list = tracks.value
    reorderRoute = apiReorderTracksRoute
  }

  const draggedIndex = list.findIndex(item => item.id === draggedId)
  const targetIndex = list.findIndex(item => item.id === targetId)

  const [removed] = list.splice(draggedIndex, 1)
  list.splice(targetIndex, 0, removed)

  const body = listType === 'albums' ? { albums: list } : 
               listType === 'songs' ? { songs: list } : 
               { tracks: list }

  await reorderRoute.run(ctx, body)
}

const handleDragEnd = (event) => {
  event.target.classList.remove('dragging')
  draggedItemId.value = null
}

const openAlbumModal = (album = null) => {
  editingAlbum.value = album
  if (album) {
    albumForm.value = {
      title: album.title,
      artist: album.artist,
      year: album.year,
      coverHash: album.coverHash || ''
    }
  } else {
    albumForm.value = {
      title: '',
      artist: '',
      year: new Date().getFullYear(),
      coverHash: ''
    }
  }
  showAlbumModal.value = true
}

const closeAlbumModal = () => {
  showAlbumModal.value = false
  editingAlbum.value = null
  uploadProgress.value = 0
}

const openSongModal = (song = null) => {
  editingSong.value = song
  if (song) {
    songForm.value = {
      title: song.title,
      lyrics: song.lyrics || '',
      tabsUrl: song.tabsUrl || '',
      stemsUrl: song.stemsUrl || ''
    }
  } else {
    songForm.value = {
      title: '',
      lyrics: '',
      tabsUrl: '',
      stemsUrl: ''
    }
  }
  showSongModal.value = true
}

const closeSongModal = () => {
  showSongModal.value = false
  editingSong.value = null
}

const openTrackModal = (track = null) => {
  editingTrack.value = track
  if (track) {
    trackForm.value = {
      name: track.name,
      fileHash: track.fileHash || '',
      color: track.color || '#6366f1'
    }
  } else {
    trackForm.value = {
      name: '',
      fileHash: '',
      color: '#6366f1'
    }
  }
  showTrackModal.value = true
}

const closeTrackModal = () => {
  showTrackModal.value = false
  editingTrack.value = null
  uploadProgress.value = 0
  uploadingFiles.value = []
  uploadedTracks.value = []
}

const handleAlbumCoverUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    uploadProgress.value = 0
    const hash = await uploadFile(file)
    albumForm.value.coverHash = hash
    uploadProgress.value = 100
  } catch (error) {
    console.error('Upload failed:', error)
    alert('Upload failed')
  }
}

const handleTrackFileUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (!files.length) return
  
  if (editingTrack.value) {
    const file = files[0]
    try {
      uploadProgress.value = 0
      const hash = await uploadFile(file)
      trackForm.value.fileHash = hash
      uploadProgress.value = 100
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed')
    }
  } else {
    uploadingFiles.value = files.map(f => ({ name: f.name, status: 'waiting' }))
    uploadedTracks.value = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      uploadingFiles.value[i].status = 'uploading...'
      
      try {
        const hash = await uploadFile(file)
        uploadedTracks.value.push({
          name: file.name.replace(/\.[^/.]+$/, ''),
          fileHash: hash,
          color: getRandomColor()
        })
        uploadingFiles.value[i].status = '✓ done'
      } catch (error) {
        console.error('Upload failed:', error)
        uploadingFiles.value[i].status = '✗ failed'
      }
    }
    
    uploadProgress.value = 100
  }
}

const uploadFile = (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      const uploadUrl = await obtainStorageFilePutUrl(ctx)
      const data = new FormData()
      data.append('Filedata', file)

      const request = new XMLHttpRequest()
      request.open('POST', uploadUrl)

      request.upload.addEventListener('progress', function (e) {
        const progress = e.total !== 0 ? (e.loaded / e.total) * 100 : 0
        uploadProgress.value = Math.round(progress)
      })

      request.addEventListener('load', function (e) {
        if (request.status === 200) {
          resolve(request.response)
        } else {
          reject('Upload error')
        }
      })

      request.addEventListener('error', function (e) {
        reject('Network error')
      })

      request.send(data)
    } catch (error) {
      reject(error)
    }
  })
}

const saveAlbum = async () => {
  isSaving.value = true
  try {
    const data = {
      ...albumForm.value,
      sortOrder: editingAlbum.value ? editingAlbum.value.sortOrder : albums.value.length
    }
    if (editingAlbum.value) {
      await apiAlbumsUpdateRoute({ id: editingAlbum.value.id }).run(ctx, data)
    } else {
      await apiAlbumsCreateRoute.run(ctx, data)
    }
    await loadAlbums()
    closeAlbumModal()
  } catch (error) {
    console.error('Save failed:', error)
    alert('Save failed')
  } finally {
    isSaving.value = false
  }
}

const saveSong = async () => {
  isSaving.value = true
  try {
    const data = {
      ...songForm.value,
      albumId: currentAlbum.value.id,
      trackNumber: editingSong.value ? editingSong.value.trackNumber : songs.value.length + 1
    }
    if (editingSong.value) {
      await apiSongsUpdateRoute({ id: editingSong.value.id }).run(ctx, data)
    } else {
      await apiSongsCreateRoute.run(ctx, data)
    }
    await loadSongs(currentAlbum.value.id)
    closeSongModal()
  } catch (error) {
    console.error('Save failed:', error)
    alert('Save failed')
  } finally {
    isSaving.value = false
  }
}

const saveTrack = async () => {
  if (editingTrack.value) {
    isSaving.value = true
    try {
      const data = {
        ...trackForm.value,
        songId: currentSong.value.id,
        sortOrder: editingTrack.value.sortOrder
      }
      await apiTracksUpdateRoute({ id: editingTrack.value.id }).run(ctx, data)
      await loadTracks(currentSong.value.id)
      closeTrackModal()
    } catch (error) {
      console.error('Save failed:', error)
      alert('Save failed')
    } finally {
      isSaving.value = false
    }
  } else {
    if (uploadedTracks.value.length === 0) {
      alert('Please upload at least one audio file')
      return
    }
    
    if (tracks.value.length + uploadedTracks.value.length > 7) {
      alert(`Cannot add ${uploadedTracks.value.length} tracks. Maximum is 7 tracks per song.`)
      return
    }
    
    isSaving.value = true
    try {
      let sortOrder = tracks.value.length
      for (const trackData of uploadedTracks.value) {
        const data = {
          ...trackData,
          songId: currentSong.value.id,
          sortOrder: sortOrder++
        }
        await apiTracksCreateRoute.run(ctx, data)
      }
      await loadTracks(currentSong.value.id)
      closeTrackModal()
    } catch (error) {
      console.error('Save failed:', error)
      alert('Save failed')
    } finally {
      isSaving.value = false
    }
  }
}

const deleteAlbum = async (id) => {
  if (!confirm('Are you sure you want to delete this album?')) return
  
  try {
    await apiAlbumsDeleteRoute({ id }).run(ctx, {})
    await loadAlbums()
  } catch (error) {
    console.error('Delete failed:', error)
    alert('Delete failed')
  }
}

const deleteSong = async (id) => {
  if (!confirm('Are you sure you want to delete this song?')) return
  
  try {
    await apiSongsDeleteRoute({ id }).run(ctx, {})
    await loadSongs(currentAlbum.value.id)
  } catch (error) {
    console.error('Delete failed:', error)
    alert('Delete failed')
  }
}

const deleteTrack = async (id) => {
  if (!confirm('Are you sure you want to delete this track?')) return
  
  try {
    await apiTracksDeleteRoute({ id }).run(ctx, {})
    await loadTracks(currentSong.value.id)
  } catch (error) {
    console.error('Delete failed:', error)
    alert('Delete failed')
  }
}

onMounted(async () => {
  await loadAlbums()
})
</script>

<style scoped>
.card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s;
}

.card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.card.dragging {
  opacity: 0.5;
  border-color: #818cf8;
}

.btn-primary {
  background: #6366f1;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #818cf8;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #374151;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-danger {
  background: #dc2626;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-danger:hover {
  background: #ef4444;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
}

.input-field:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #1a1a1a;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
</style>