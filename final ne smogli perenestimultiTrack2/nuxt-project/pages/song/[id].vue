<template>
  <!-- Desktop Version -->
  <div class="hidden md:block min-h-screen bg-darker overflow-hidden">
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="fas fa-spinner fa-spin text-4xl text-accent mb-4"></i>
        <p class="text-text-secondary">Загрузка...</p>
      </div>
    </div>

    <div v-else-if="error || !song" class="flex items-center justify-center min-h-screen">
      <div class="bg-neutral-800 border border-neutral-600 rounded-xl p-6 max-w-md">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        Песня не найдена
      </div>
    </div>

    <div v-else class="container mx-auto px-4 py-3 max-w-4xl">
      <!-- Navigation -->
      <div class="mb-6 flex items-center gap-3">
        <NuxtLink 
          to="/" 
          class="inline-flex items-center gap-2 px-4 py-2 bg-dark hover:bg-neutral-800 rounded-xl transition-colors text-text-secondary hover:text-text-primary"
        >
          <i class="fas fa-home"></i>
        </NuxtLink>
        <NuxtLink 
          v-if="album"
          :to="`/album/${album.id}`" 
          class="inline-flex items-center gap-2 px-4 py-2 bg-dark hover:bg-neutral-800 rounded-xl transition-colors text-text-secondary hover:text-text-primary"
        >
          <i class="fas fa-arrow-left"></i>
          <span>{{ album.title }}</span>
        </NuxtLink>
      </div>
      
      <div class="space-y-4">
        <!-- Song Title -->
        <div class="mb-2">
          <h1 class="text-3xl md:text-4xl font-bold text-text-primary mb-2">{{ song.title }}</h1>
        </div>

        <div class="space-y-3">
          <MultitrackPlayer 
            v-if="tracks.length > 0" 
            :tracks="tracks" 
            :song-title="song.title" 
          />
          
          <div v-else class="bg-dark rounded-xl p-8 text-center">
            <i class="fas fa-info-circle text-4xl text-muted mb-4"></i>
            <p class="text-text-secondary">Треки для этой песни не найдены</p>
          </div>

          <!-- Action Buttons -->
          <div v-if="song.lyrics || song.tabsUrl || song.stemsUrl" class="space-y-3">
            <div class="flex gap-3">
              <button 
                v-if="song.lyrics" 
                @click="showLyrics = !showLyrics"
                class="flex-1 flex items-center justify-center gap-2 px-2 py-2 md:px-6 md:py-3 bg-neutral-500 hover:bg-neutral-400 rounded-xl transition-colors text-white font-medium"
              >
                <i class="fas fa-align-left"></i>
                <span>ТЕКСТ</span>
              </button>
              
              <a 
                v-if="song.tabsUrl" 
                :href="song.tabsUrl" 
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 flex items-center justify-center gap-2 px-2 py-2 md:px-6 md:py-3 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-colors text-white font-medium"
              >
                <i class="fas fa-guitar"></i>
                <span>GP TAB</span>
              </a>
              
              <a 
                v-if="song.stemsUrl" 
                :href="song.stemsUrl" 
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 flex items-center justify-center gap-2 px-2 py-2 md:px-6 md:py-3 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-colors text-white font-medium"
              >
                <i class="fas fa-download"></i>
                <span>STEMS</span>
              </a>
            </div>
            
            <!-- Lyrics Section (hidden by default) -->
            <transition
              enter-active-class="transition-all duration-300 ease-out"
              leave-active-class="transition-all duration-300 ease-in"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-[2000px]"
              leave-from-class="opacity-100 max-h-[2000px]"
              leave-to-class="opacity-0 max-h-0"
            >
              <div 
                v-if="song.lyrics && showLyrics" 
                class="overflow-hidden"
              >
                <pre class="whitespace-pre-wrap text-text-primary text-sm leading-relaxed" style="font-family: 'Roboto', sans-serif;">{{ song.lyrics }}</pre>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Version (Winamp Style) -->
  <div class="md:hidden min-h-screen bg-black flex items-center justify-center p-2">
    <div v-if="pending" class="text-center">
      <div class="text-lime-500 text-sm" style="font-family: 'Courier New', monospace;">Loading...</div>
    </div>

    <div v-else-if="error || !song" class="text-center">
      <div class="text-red-500 text-xs px-4" style="font-family: 'Courier New', monospace;">Песня не найдена</div>
    </div>

    <div v-else class="w-full max-w-md">
      <!-- Winamp Window -->
      <div class="bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 border-4 border-gray-600 rounded-2xl shadow-2xl overflow-hidden" style="font-family: 'Courier New', monospace;">
        <!-- Top Buttons -->
        <div class="flex justify-between items-center p-2 border-b-2 border-gray-700">
          <NuxtLink 
            v-if="album"
            :to="`/album/${album.id}`" 
            class="px-4 py-2 bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-900 rounded text-xs font-bold flex items-center gap-1 hover:from-gray-500 hover:to-gray-700 text-white"
          >
            <i class="fas fa-arrow-left"></i>
            <span>ПЕСНИ</span>
          </NuxtLink>
          <NuxtLink 
            to="/" 
            class="px-4 py-2 bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-900 rounded text-xs font-bold flex items-center gap-1 hover:from-gray-500 hover:to-gray-700 text-white"
          >
            <i class="fas fa-home"></i>
            <span>АЛЬБОМЫ</span>
          </NuxtLink>
        </div>

        <!-- Display with scrolling text -->
        <div class="bg-black border-4 border-gray-700 mx-2 my-2 p-2 rounded overflow-hidden" style="height: 50px;">
          <!-- Loading stems message -->
          <div v-if="stemsLoading" class="flex items-center justify-center h-full">
            <div class="text-lime-500 text-2xl font-bold animate-blink">загружаю стемы</div>
          </div>
          <!-- Song title marquee -->
          <div v-else class="whitespace-nowrap text-lime-500 text-2xl font-bold animate-marquee" :key="song.title">
            {{ song.title }}
          </div>
        </div>

        <!-- Multitrack Player -->
        <MultitrackPlayer 
          v-if="tracks.length > 0" 
          :tracks="tracks" 
          :song-title="song.title"
          mobile-style
          @ready="stemsLoading = false"
        />

        <!-- Action Buttons -->
        <div class="flex gap-2 p-2 border-t-2 border-gray-700">
          <button 
            v-if="song.lyrics" 
            @click="showLyrics = !showLyrics"
            class="flex-1 px-3 py-2 bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-900 rounded text-xs font-bold hover:from-gray-500 hover:to-gray-700 flex items-center justify-center gap-1 text-white"
          >
            <i class="fas fa-align-left"></i>
            <span>Текст</span>
          </button>
          
          <a 
            v-if="song.tabsUrl" 
            :href="song.tabsUrl" 
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 px-3 py-2 bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-900 rounded text-xs font-bold hover:from-gray-500 hover:to-gray-700 flex items-center justify-center gap-1 text-white"
          >
            <i class="fas fa-guitar"></i>
            <span>GP TAB</span>
          </a>
          
          <a 
            v-if="song.stemsUrl" 
            :href="song.stemsUrl" 
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 px-3 py-2 bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-900 rounded text-xs font-bold hover:from-gray-500 hover:to-gray-700 flex items-center justify-center gap-1 text-white"
          >
            <i class="fas fa-download"></i>
            <span>STEMS</span>
          </a>
        </div>

        <!-- Lyrics (if shown) -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-96"
          leave-from-class="opacity-100 max-h-96"
          leave-to-class="opacity-0 max-h-0"
        >
          <div 
            v-if="song.lyrics && showLyrics" 
            class="overflow-hidden border-t-2 border-gray-700"
          >
            <div class="p-3 bg-black max-h-96 overflow-y-auto">
              <pre class="whitespace-pre-wrap text-lime-500 text-xs leading-relaxed">{{ song.lyrics }}</pre>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const route = useRoute()
const { data, pending, error } = await useFetch(`/api/songs/${route.params.id}`)

const song = computed(() => data.value?.song)
const album = computed(() => data.value?.album)
const tracks = computed(() => data.value?.tracks || [])

const showLyrics = ref(false)
const stemsLoading = ref(true)
</script>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.animate-marquee {
  animation: marquee 8s linear infinite;
}

.animate-blink {
  animation: blink 0.8s ease-in-out infinite;
}
</style>