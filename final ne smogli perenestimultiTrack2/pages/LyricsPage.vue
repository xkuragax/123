<template>
  <div class="min-h-screen bg-darker">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-accent mb-4"></i>
        <p class="text-text-secondary">Загрузка...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="bg-neutral-800 border border-neutral-600 rounded-lg p-6 max-w-md">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        {{ error }}
      </div>
    </div>

    <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <!-- Navigation -->
      <div class="mb-6 flex items-center gap-3">
        <a 
          :href="songRoute({ songId: song.id }).url()" 
          class="inline-flex items-center gap-2 px-4 py-2 bg-dark hover:bg-neutral-800 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
        >
          <i class="fas fa-arrow-left"></i>
          <span>Назад к плееру</span>
        </a>
      </div>

      <!-- Song Info -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-text-primary mb-2">{{ song.title }}</h1>
      </div>

      <!-- Lyrics -->
      <div class="bg-dark rounded-lg p-6 md:p-8">
        <div class="text-text-secondary whitespace-pre-line leading-relaxed text-3xl">
          {{ song.lyrics }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiPublicSongRoute } from '../api/albums'
import { songRoute } from '../song'

const props = defineProps({
  songId: {
    type: String,
    required: true
  }
})

const loading = ref(true)
const error = ref(null)
const song = ref({})
const album = ref(null)

const loadSongData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const data = await apiPublicSongRoute({ songId: props.songId }).run(ctx)
    
    song.value = data.song
    album.value = data.album
    
    if (!song.value.lyrics) {
      error.value = 'Текст для этой песни не найден'
    }
    
    loading.value = false
  } catch (err) {
    error.value = err.message || 'Ошибка загрузки данных песни'
    loading.value = false
  }
}

onMounted(() => {
  loadSongData()
})
</script>