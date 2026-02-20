<template>
  <div class="min-h-screen bg-darker">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="pending" class="text-center text-text-secondary py-12">
        <i class="fas fa-spinner fa-spin text-4xl"></i>
        <p class="mt-4">Загрузка альбомов...</p>
      </div>

      <div v-else-if="error" class="text-center text-red-500 py-12">
        <i class="fas fa-exclamation-circle text-4xl"></i>
        <p class="mt-4">{{ error }}</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <NuxtLink
          v-for="album in albums"
          :key="album.id"
          :to="`/album/${album.id}`"
          class="group bg-dark rounded-lg overflow-hidden hover:bg-muted transition-all duration-200 cursor-pointer transform hover:scale-105"
        >
          <div class="aspect-square bg-darker relative">
            <img
              v-if="album.coverHash"
              :src="`https://fs.chatium.ru/thumbnail/${album.coverHash}/s/400x400`"
              :alt="album.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <i class="fas fa-music text-6xl text-text-secondary"></i>
            </div>
          </div>
          
          <div class="p-4">
            <h3 class="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-1">
              {{ album.title }}
            </h3>
            <p class="text-text-secondary text-sm mt-1 line-clamp-1">
              {{ album.artist }}
            </p>
            <p v-if="album.year" class="text-text-secondary text-xs mt-1">
              {{ album.year }}
            </p>
          </div>
        </NuxtLink>
      </div>

      <div v-if="!pending && albums.length === 0" class="text-center text-text-secondary py-12">
        <i class="fas fa-compact-disc text-4xl"></i>
        <p class="mt-4">Альбомы не найдены</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data: albums, pending, error } = await useFetch('/api/albums')
</script>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
</style>