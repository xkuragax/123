const { ref, onMounted } = Vue;

export default {
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="loading" class="text-center text-text-secondary py-12">
        <i class="fas fa-spinner fa-spin text-4xl"></i>
        <p class="mt-4">Загрузка альбомов...</p>
      </div>

      <div v-else-if="error" class="text-center text-red-500 py-12">
        <i class="fas fa-exclamation-circle text-4xl"></i>
        <p class="mt-4">{{ error }}</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <router-link
          v-for="album in albums"
          :key="album.id"
          :to="'/album/' + album.id"
          class="group bg-dark rounded-lg overflow-hidden hover:bg-muted transition-all duration-200 cursor-pointer transform hover:scale-105"
        >
          <div class="aspect-square bg-darker relative">
            <img
              v-if="album.cover_hash"
              :src="$getFileUrl(album.cover_hash)"
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
        </router-link>
      </div>

      <div v-if="!loading && albums.length === 0" class="text-center text-text-secondary py-12">
        <i class="fas fa-compact-disc text-4xl"></i>
        <p class="mt-4">Альбомов пока нет</p>
      </div>
    </div>
  `,
  
  setup() {
    const albums = ref([]);
    const loading = ref(true);
    const error = ref(null);
    
    onMounted(async () => {
      try {
        albums.value = await api.getAlbums();
      } catch (e) {
        error.value = e.message || 'Ошибка загрузки альбомов';
      } finally {
        loading.value = false;
      }
    });
    
    return { albums, loading, error };
  }
};
