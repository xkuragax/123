<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error || !album" class="text-center py-12">
      <div class="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-exclamation-circle text-danger text-2xl"></i>
      </div>
      <p class="text-gray-400">Альбом не найден</p>
      <NuxtLink to="/" class="mt-4 inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white text-sm transition">
        <i class="fas fa-arrow-left mr-2"></i>В каталог
      </NuxtLink>
    </div>
    
    <div v-else>
      <!-- Album Header -->
      <div class="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6 sm:mb-8">
        <!-- Cover -->
        <div class="w-full sm:w-48 md:w-56 lg:w-64 flex-shrink-0 mx-auto sm:mx-0">
          <div class="aspect-square rounded-xl overflow-hidden bg-dark-light shadow-2xl">
            <img 
              v-if="album.coverHash"
              :src="`https://fs.chatium.ru/thumbnail/${album.coverHash}/s/400x400`"
              :alt="album.title"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <i class="fas fa-compact-disc text-5xl sm:text-6xl text-gray-600"></i>
            </div>
          </div>
        </div>
        
        <!-- Info -->
        <div class="flex-1 text-center sm:text-left">
          <p class="text-primary text-xs sm:text-sm font-medium uppercase tracking-wide mb-1 sm:mb-2">Альбом</p>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">{{ album.title }}</h1>
          <p class="text-lg sm:text-xl text-gray-300 mb-2 sm:mb-4">{{ album.artist }}</p>
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-sm text-gray-500">
            <span v-if="album.year">{{ album.year }}</span>
            <span v-if="album.year" class="hidden sm:inline">•</span>
            <span>{{ songs.length }} {{ formatTrackCount(songs.length) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Songs List -->
      <div class="bg-dark-light rounded-xl overflow-hidden border border-gray-800">
        <!-- Header -->
        <div class="hidden sm:flex p-4 border-b border-gray-700 items-center text-gray-400 text-sm">
          <span class="w-12 text-center">#</span>
          <span class="flex-1">Название</span>
          <span class="w-24 text-right">Длительность</span>
          <span class="w-32 text-right">Действия</span>
        </div>
        
        <!-- Empty State -->
        <div v-if="songs.length === 0" class="p-8 text-center text-gray-500">
          <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-music text-gray-600 text-2xl"></i>
          </div>
          <p>В альбоме пока нет песен</p>
        </div>
        
        <!-- Songs -->
        <div v-else>
          <NuxtLink 
            v-for="(song, index) in songs" 
            :key="song.id"
            :to="`/song/${song.id}`"
            class="flex items-center p-3 sm:p-4 hover:bg-white/5 transition group border-b border-gray-800 last:border-0"
          >
            <!-- Number -->
            <span class="w-8 sm:w-12 text-center text-gray-500 group-hover:text-primary text-sm sm:text-base flex-shrink-0">
              {{ index + 1 }}
            </span>
            
            <!-- Title -->
            <div class="flex-1 min-w-0 mr-2 sm:mr-4">
              <h3 class="text-white font-medium group-hover:text-primary transition truncate text-sm sm:text-base">
                {{ song.title }}
              </h3>
            </div>
            
            <!-- Duration -->
            <span class="hidden sm:block w-24 text-right text-gray-400 text-sm flex-shrink-0">
              {{ formatDuration(song.duration) }}
            </span>
            
            <!-- Actions -->
            <div class="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0">
              <span class="sm:hidden text-gray-400 text-xs mr-2">
                {{ formatDuration(song.duration) }}
              </span>
              <button class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition">
                <i class="fas fa-play text-xs sm:text-sm"></i>
              </button>
              <NuxtLink 
                v-if="song.lyrics" 
                :to="`/lyrics/${song.id}`" 
                @click.stop
                class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-secondary hover:text-white transition"
              >
                <i class="fas fa-align-left text-xs sm:text-sm"></i>
              </NuxtLink>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: album, pending: albumPending, error: albumError } = await useFetch(`/api/albums/${route.params.id}`)
const { data: songs, pending: songsPending, error: songsError } = await useFetch(`/api/albums/${route.params.id}/songs`)

const pending = computed(() => albumPending.value || songsPending.value)
const error = computed(() => albumError.value || songsError.value)

function formatDuration(seconds) {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatTrackCount(count) {
  if (count === 1) return 'трек'
  if (count < 5) return 'трека'
  return 'треков'
}
</script>