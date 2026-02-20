<template>
  <!-- Desktop Version -->
  <div class="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <a 
      :href="indexPageRoute.url()" 
      class="inline-flex items-center gap-2 px-4 py-2 bg-dark hover:bg-neutral-800 rounded-lg transition-colors text-text-secondary hover:text-text-primary mb-6"
    >
      <i class="fas fa-home"></i>
    </a>

    <div v-if="loading" class="text-center text-text-secondary py-12">
      <i class="fas fa-spinner fa-spin text-4xl"></i>
      <p class="mt-4">Loading album...</p>
    </div>

    <div v-else-if="error" class="text-center text-red-500 py-12">
      <i class="fas fa-exclamation-circle text-4xl"></i>
      <p class="mt-4">{{ error }}</p>
    </div>

    <div v-else>
      <div class="mb-12">
        <h1 class="text-4xl font-bold text-text-primary mb-4">{{ album.title }}</h1>
      </div>

      <div v-if="songsLoading" class="text-center text-text-secondary py-8">
        <i class="fas fa-spinner fa-spin text-2xl"></i>
        <p class="mt-2">Loading songs...</p>
      </div>

      <div v-else-if="songs.length === 0" class="text-center text-text-secondary py-8">
        <i class="fas fa-music text-3xl"></i>
        <p class="mt-2">No songs in this album</p>
      </div>

      <div v-else class="bg-dark rounded-lg overflow-hidden">
        <div class="divide-y divide-muted">
          <a
            v-for="song in songs"
            :key="song.id"
            :href="songRoute({ songId: song.id }).url()"
            class="flex items-center px-6 py-4 hover:bg-muted transition-colors cursor-pointer group"
          >
            <div class="flex-shrink-0 w-8 text-text-secondary text-sm">
              {{ song.trackNumber || '—' }}
            </div>
            <div class="flex-1 ml-4">
              <h3 class="text-text-primary font-medium group-hover:text-accent transition-colors">
                {{ song.title }}
              </h3>
            </div>
            <div v-if="song.duration" class="text-text-secondary text-sm ml-4">
              {{ formatDuration(song.duration) }}
            </div>
            <i class="fas fa-chevron-right text-text-secondary ml-4 opacity-0 group-hover:opacity-100 transition-opacity"></i>
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Version (Winamp Playlist Style) -->
  <div class="md:hidden min-h-screen bg-black flex flex-col p-2">
    <!-- Winamp Playlist Window -->
    <div class="flex-1 flex flex-col" style="font-family: 'Courier New', monospace;">
      <!-- Header -->
      <div class="bg-gradient-to-b from-gray-600 to-gray-800 px-2 py-2 flex items-center justify-center border-2 border-gray-400 rounded-t-lg">
        <div class="text-white text-base font-bold uppercase tracking-wider text-center">{{ album?.title || 'Loading...' }}</div>
      </div>

      <!-- Playlist Content -->
      <div class="flex-1 bg-black border-2 border-l-gray-400 border-r-gray-800 border-b-gray-800 flex flex-col overflow-hidden">
        <div v-if="loading || songsLoading" class="flex-1 flex items-center justify-center">
          <div class="text-lime-500 text-sm">Loading...</div>
        </div>

        <div v-else-if="error" class="flex-1 flex items-center justify-center">
          <div class="text-red-500 text-xs px-4">{{ error }}</div>
        </div>

        <div v-else-if="songs.length === 0" class="flex-1 flex items-center justify-center">
          <div class="text-lime-500 text-xs">No songs</div>
        </div>

        <div v-else class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-black">
          <a
            v-for="(song, index) in songs"
            :key="song.id"
            :href="songRoute({ songId: song.id }).url()"
            class="block px-2 py-1.5 cursor-pointer transition-colors"
            :class="[
              hoveredSong === song.id 
                ? 'bg-blue-600 text-white' 
                : 'text-lime-500 hover:bg-blue-600 hover:text-white'
            ]"
            @mouseenter="hoveredSong = song.id"
            @mouseleave="hoveredSong = null"
          >
            <div class="text-base leading-relaxed font-medium">
              <span class="font-bold">{{ index + 1 }}.</span>
              <span class="ml-2">{{ song.title }}</span>
            </div>
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gradient-to-b from-gray-800 to-gray-600 px-2 py-2 flex items-center justify-between border-2 border-t-gray-500 border-l-gray-400 border-r-gray-800 border-b-gray-800 rounded-b-lg">
        <a 
          :href="indexPageRoute.url()" 
          class="px-5 py-2 bg-gradient-to-b from-gray-500 to-gray-700 border border-gray-900 rounded text-white text-sm font-bold uppercase hover:from-gray-400 hover:to-gray-600 transition-colors"
        >
          АЛЬБОМЫ
        </a>
        <div class="text-white text-xs font-bold">Хамло</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiAlbumByIdRoute, apiSongsByAlbumRoute } from '../api/albums'
import { indexPageRoute } from '../index'
import { songRoute } from '../song'
import { getThumbnailUrl } from '@app/storage'

const props = defineProps({
  albumId: String
})

const album = ref(null)
const songs = ref([])
const loading = ref(true)
const songsLoading = ref(true)
const error = ref(null)
const hoveredSong = ref(null)

function formatDuration(seconds) {
  if (!seconds) return '—'
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

onMounted(async () => {
  try {
    album.value = await apiAlbumByIdRoute({ id: props.albumId }).run(ctx)
  } catch (e) {
    error.value = e.message || 'Failed to load album'
  } finally {
    loading.value = false
  }

  if (album.value) {
    try {
      songs.value = await apiSongsByAlbumRoute({ albumId: props.albumId }).run(ctx)
    } catch (e) {
      console.error('Failed to load songs:', e)
    } finally {
      songsLoading.value = false
    }
  }
})
</script>