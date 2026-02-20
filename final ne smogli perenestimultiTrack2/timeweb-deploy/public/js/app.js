const { createApp, ref, onMounted } = Vue;

createApp({
  template: `
    <div class="min-h-screen bg-dark text-text-primary font-sans">
      <!-- Navigation -->
      <nav class="sticky top-0 z-50 bg-muted/90 backdrop-blur-md border-b border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <a href="/" @click.prevent="goHome" class="flex items-center gap-3 text-accent hover:text-accent-hover transition-colors">
              <i class="fas fa-music text-2xl"></i>
              <span class="text-xl font-bold hidden sm:inline">MultiTrack Player</span>
              <span class="text-xl font-bold sm:hidden">MTP</span>
            </a>
            <div class="flex items-center gap-2">
              <a href="/" @click.prevent="goHome" class="px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all text-sm sm:text-base">
                <i class="fas fa-compact-disc sm:mr-2"></i>
                <span class="hidden sm:inline">Альбомы</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32">
        
        <!-- Loading -->
        <div v-if="loading" class="text-center py-20">
          <i class="fas fa-spinner fa-spin text-5xl text-accent mb-4"></i>
          <p class="text-text-secondary">Загрузка...</p>
        </div>

        <!-- Error -->
        <div v-if="error" class="text-center py-20 text-red-400">
          <i class="fas fa-exclamation-circle text-5xl mb-4"></i>
          <p>{{ error }}</p>
        </div>

        <!-- Catalog -->
        <div v-if="!loading && !error && !selectedAlbum && !selectedSong">
          <div v-if="albums.length === 0" class="text-center py-20 text-text-secondary">
            <i class="fas fa-compact-disc text-6xl mb-4"></i>
            <p>Нет альбомов</p>
          </div>
          
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            <div v-for="album in albums" :key="album.id" 
                 class="group bg-muted rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/50"
                 @click="selectAlbum(album)">
              <div class="aspect-square relative bg-gradient-to-br from-muted to-dark">
                <img v-if="album.coverHash" :src="'https://fs.chatium.ru/thumbnail/' + album.coverHash + '/s/400x'" 
                     class="w-full h-full object-cover" :alt="album.title">
                <div v-else class="w-full h-full flex items-center justify-center">
                  <i class="fas fa-compact-disc text-5xl sm:text-6xl text-text-secondary"></i>
                </div>
              </div>
              <div class="p-3 sm:p-4">
                <h3 class="font-semibold text-text-primary truncate group-hover:text-accent transition-colors text-sm sm:text-base">
                  {{ album.title }}
                </h3>
                <p class="text-text-secondary text-xs sm:text-sm mt-1 truncate">{{ album.artist }}</p>
                <p v-if="album.year" class="text-text-secondary text-xs mt-1">{{ album.year }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Album Detail -->
        <div v-if="selectedAlbum && !selectedSong">
          <button @click="goHome" 
                  class="mb-4 sm:mb-6 px-4 py-2 bg-muted hover:bg-white/10 rounded-xl transition-all flex items-center gap-2 text-sm">
            <i class="fas fa-arrow-left"></i> Назад к альбомам
          </button>
          
          <div class="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6 sm:mb-8">
            <div class="w-full sm:w-48 md:w-64 aspect-square rounded-2xl overflow-hidden bg-muted flex-shrink-0 mx-auto sm:mx-0 max-w-[200px] sm:max-w-none">
              <img v-if="selectedAlbum.coverHash" :src="'https://fs.chatium.ru/thumbnail/' + selectedAlbum.coverHash + '/s/400x'" 
                   class="w-full h-full object-cover">
              <div v-else class="w-full h-full flex items-center justify-center">
                <i class="fas fa-compact-disc text-6xl sm:text-8xl text-text-secondary"></i>
              </div>
            </div>
            <div class="flex-1 text-center sm:text-left">
              <p class="text-accent font-semibold text-xs tracking-widest mb-2">АЛЬБОМ</p>
              <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">{{ selectedAlbum.title }}</h1>
              <p class="text-lg sm:text-xl text-text-secondary mb-2">{{ selectedAlbum.artist }}</p>
              <p v-if="selectedAlbum.year" class="text-text-secondary">{{ selectedAlbum.year }}</p>
            </div>
          </div>

          <h2 class="text-xl sm:text-2xl font-semibold mb-4">Песни</h2>
          <div class="flex flex-col gap-2">
            <div v-for="(song, index) in songs" :key="song.id" 
                 class="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-xl cursor-pointer hover:bg-white/5 transition-all"
                 @click="selectSong(song)">
              <span class="w-6 sm:w-8 text-center text-text-secondary font-medium text-sm">{{ index + 1 }}</span>
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <i class="fas fa-play text-white text-xs sm:text-sm ml-0.5"></i>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-medium truncate text-sm sm:text-base">{{ song.title }}</h3>
                <p v-if="song.duration" class="text-text-secondary text-xs sm:text-sm">{{ formatDuration(song.duration) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Player -->
        <div v-if="selectedSong">
          <button @click="backToAlbum"
                  class="mb-4 sm:mb-6 px-4 py-2 bg-muted hover:bg-white/10 rounded-xl transition-all flex items-center gap-2 text-sm">
            <i class="fas fa-arrow-left"></i> Назад к альбому
          </button>

          <div class="text-center mb-6 sm:mb-8">
            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{{ selectedSong.title }}</h1>
            <p class="text-text-secondary">{{ selectedAlbum?.title }}</p>
          </div>

          <!-- Progress -->
          <div class="bg-muted rounded-2xl p-4 sm:p-6 mb-6 border border-white/10">
            <div class="flex justify-between text-text-secondary text-xs sm:text-sm mb-2">
              <span>{{ formatTime(currentTime) }}</span>
              <span>{{ formatTime(duration) }}</span>
            </div>
            <input type="range" min="0" :max="duration || 100" v-model="currentTime" @input="seek"
                   class="w-full h-1.5 bg-gray-700 rounded-full cursor-pointer appearance-none player-slider">
          </div>

          <!-- Controls -->
          <div class="flex justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <button @click="stopPlayback"
                    class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted hover:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all">
              <i class="fas fa-stop text-lg sm:text-xl"></i>
            </button>
            <button @click="togglePlayback"
                    class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center text-white shadow-lg shadow-accent/30 transition-all hover:scale-105">
              <i v-if="isPlaying" class="fas fa-pause text-2xl sm:text-3xl"></i>
              <i v-else class="fas fa-play text-2xl sm:text-3xl ml-1"></i>
            </button>
          </div>

          <!-- Tracks -->
          <div v-if="tracks.length > 0" class="flex flex-col gap-3">
            <div v-for="track in tracks" :key="track.id" 
                 class="bg-muted rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <div class="w-2 sm:w-3 h-10 sm:h-12 rounded-full flex-shrink-0" :style="{backgroundColor: track.color || '#6366f1'}"></div>
              <h3 class="flex-1 font-medium text-sm sm:text-base truncate">{{ track.name }}</h3>
              <div class="flex items-center gap-2">
                <button @click="toggleMute(track)"
                        :class="['w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center transition-all', 
                                 track.muted ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-text-secondary hover:text-text-primary']">
                  <i :class="track.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up'"></i>
                </button>
                <button @click="toggleSolo(track)"
                        :class="['w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center transition-all hidden sm:flex',
                                 track.solo ? 'bg-accent/20 text-accent' : 'bg-white/5 text-text-secondary hover:text-text-primary']">
                  <i class="fas fa-headphones"></i>
                </button>
              </div>
              <input type="range" min="0" max="100" v-model="track.volume" @input="updateVolume(track)"
                     class="w-16 sm:w-24 h-1 bg-gray-700 rounded-full cursor-pointer appearance-none player-slider hidden xs:block">
            </div>
          </div>

          <div v-else class="text-center py-12 text-text-secondary">
            <i class="fas fa-music text-5xl mb-4"></i>
            <p>Нет треков для этой песни</p>
          </div>
        </div>
      </main>
    </div>
  `,
  setup() {
    const albums = ref([]);
    const songs = ref([]);
    const tracks = ref([]);
    const selectedAlbum = ref(null);
    const selectedSong = ref(null);
    const loading = ref(true);
    const error = ref(null);
    
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    let audioContext = null;
    let audioSources = [];
    let audioBuffers = [];
    let startTime = 0;
    let playbackTimer = null;

    const loadAlbums = async () => {
      try {
        loading.value = true;
        error.value = null;
        const response = await fetch('/api/albums');
        if (!response.ok) throw new Error('Ошибка загрузки альбомов');
        albums.value = await response.json();
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    };

    const selectAlbum = async (album) => {
      selectedAlbum.value = album;
      loading.value = true;
      try {
        const response = await fetch('/api/albums/' + album.id + '/songs');
        if (!response.ok) throw new Error('Ошибка загрузки песен');
        songs.value = await response.json();
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    };

    const selectSong = async (song) => {
      selectedSong.value = song;
      stopPlayback();
      try {
        const response = await fetch('/api/songs/' + song.id + '/tracks');
        if (!response.ok) throw new Error('Ошибка загрузки треков');
        const trackData = await response.json();
        tracks.value = trackData.map(t => ({ ...t, volume: 100, muted: false, solo: false }));
        if (tracks.value.length > 0) {
          await loadAudioFiles();
        }
      } catch (e) {
        error.value = e.message;
      }
    };

    const loadAudioFiles = async () => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioBuffers = [];
      for (const track of tracks.value) {
        if (track.fileHash) {
          try {
            const response = await fetch('https://fs.chatium.ru/get/' + track.fileHash);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            audioBuffers.push({ trackId: track.id, buffer: audioBuffer });
            if (!duration.value && audioBuffer.duration) {
              duration.value = audioBuffer.duration;
            }
          } catch (e) {
            console.error('Ошибка загрузки аудио:', e);
          }
        }
      }
    };

    const togglePlayback = () => {
      if (isPlaying.value) {
        pausePlayback();
      } else {
        startPlayback();
      }
    };

    const startPlayback = () => {
      if (!audioContext || audioBuffers.length === 0) return;
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      audioSources = [];
      const hasSolo = tracks.value.some(t => t.solo);

      for (const buffer of audioBuffers) {
        const track = tracks.value.find(t => t.id === buffer.trackId);
        if (!track) continue;
        if (hasSolo && !track.solo) continue;
        if (track.muted) continue;

        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = buffer.buffer;
        gainNode.gain.value = track.muted ? 0 : (track.volume / 100);
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const offset = currentTime.value;
        source.start(0, offset);
        
        audioSources.push({ source, gainNode, trackId: track.id });
        track.gainNode = gainNode;
      }

      startTime = audioContext.currentTime - currentTime.value;
      isPlaying.value = true;
      
      playbackTimer = setInterval(() => {
        currentTime.value = audioContext.currentTime - startTime;
        if (currentTime.value >= duration.value) {
          stopPlayback();
        }
      }, 100);
    };

    const pausePlayback = () => {
      audioSources.forEach(({ source }) => {
        try { source.stop(); } catch (e) {}
      });
      audioSources = [];
      isPlaying.value = false;
      if (playbackTimer) clearInterval(playbackTimer);
    };

    const stopPlayback = () => {
      pausePlayback();
      currentTime.value = 0;
    };

    const seek = () => {
      const wasPlaying = isPlaying.value;
      pausePlayback();
      if (wasPlaying) startPlayback();
    };

    const toggleMute = (track) => {
      track.muted = !track.muted;
      updateVolume(track);
    };

    const toggleSolo = (track) => {
      track.solo = !track.solo;
      if (isPlaying.value) {
        pausePlayback();
        startPlayback();
      }
    };

    const updateVolume = (track) => {
      if (track.gainNode) {
        track.gainNode.gain.value = track.muted ? 0 : (track.volume / 100);
      }
    };

    const goHome = () => {
      stopPlayback();
      selectedAlbum.value = null;
      selectedSong.value = null;
    };

    const backToAlbum = () => {
      stopPlayback();
      selectedSong.value = null;
    };

    const formatDuration = (seconds) => {
      if (!seconds) return '';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return mins + ':' + (secs < 10 ? '0' : '') + secs;
    };

    const formatTime = (time) => {
      const mins = Math.floor(time / 60);
      const secs = Math.floor(time % 60);
      return mins + ':' + (secs < 10 ? '0' : '') + secs;
    };

    onMounted(() => {
      loadAlbums();
    });

    return {
      albums, songs, tracks,
      selectedAlbum, selectedSong,
      loading, error,
      isPlaying, currentTime, duration,
      loadAlbums, selectAlbum, selectSong,
      togglePlayback, stopPlayback, seek,
      toggleMute, toggleSolo, updateVolume,
      goHome, backToAlbum,
      formatDuration, formatTime
    };
  }
}).mount('#app');
