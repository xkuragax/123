<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error || !song" class="text-center py-12">
      <div class="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-exclamation-circle text-danger text-2xl"></i>
      </div>
      <p class="text-gray-400">Песня не найдена</p>
      <NuxtLink to="/" class="mt-4 inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white text-sm transition">
        <i class="fas fa-arrow-left mr-2"></i>В каталог
      </NuxtLink>
    </div>
    
    <div v-else>
      <!-- Back link -->
      <NuxtLink 
        :to="`/song/${song.id}`" 
        class="inline-flex items-center text-gray-400 hover:text-white mb-4 sm:mb-6 transition text-sm sm:text-base"
      >
        <i class="fas fa-arrow-left mr-2"></i>
        <span class="hidden sm:inline">К плееру</span>
        <span class="sm:hidden">Назад</span>
      </NuxtLink>
      
      <!-- Header -->
      <div class="mb-4 sm:mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{{ song.title }}</h1>
        <p class="text-lg sm:text-xl text-gray-400">{{ album?.artist }}</p>
      </div>
      
      <!-- Lyrics -->
      <div v-if="song.lyrics" class="bg-dark-light rounded-xl p-4 sm:p-6 md:p-8 border border-gray-800">
        <pre class="text-gray-300 whitespace-pre-wrap font-sans text-base sm:text-lg leading-relaxed">{{ song.lyrics }}</pre>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-8 sm:py-12 text-gray-500 bg-dark-light rounded-xl border border-gray-800">
        <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-align-left text-gray-600 text-2xl"></i>
        </div>
        <p class="text-sm sm:text-base">Текст песни отсутствует</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: song, pending, error } = await useFetch(`/api/songs/${route.params.id}`)
const { data: album } = await useFetch(() => song.value ? `/api/albums/${song.value.albumId}` : null)
</script>