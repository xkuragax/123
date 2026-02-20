const { ref, reactive, onMounted, onUnmounted, watch } = Vue;

export default {
  props: {
    tracks: {
      type: Array,
      required: true
    },
    songTitle: {
      type: String,
      default: 'Untitled Song'
    },
    mobileStyle: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['ready'],
  
  template: `
    <!-- Desktop Version -->
    <div v-if="!mobileStyle" class="multitrack-player text-white p-4 max-w-5xl mx-auto">
      <!-- Error State -->
      <div v-if="error" class="bg-neutral-800 border border-neutral-600 rounded p-4 mb-4">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        {{ error }}
      </div>

      <!-- Player Interface -->
      <div>
        <!-- Tracks Controls -->
        <div class="space-y-1.5 mb-4">
          <div
            v-for="track in tracks"
            :key="track.id"
            class="p-3 bg-neutral-800 rounded-lg"
          >
            <div class="flex gap-3">
              <!-- Left: Controls + Track Name -->
              <div class="flex-shrink-0">
                <!-- Mute/Solo buttons -->
                <div class="flex gap-2 mb-1.5">
                  <button
                    @click="toggleMute(track.id)"
                    :class="[
                      'px-4 py-2 rounded-md transition-colors text-sm font-medium',
                      trackStates[track.id]?.muted
                        ? 'bg-red-400/70 text-white'
                        : 'bg-neutral-700 text-neutral-400 hover:text-neutral-200'
                    ]"
                    :title="trackStates[track.id]?.muted ? 'Включить' : 'Заглушить'"
                  >
                    <i v-if="trackStates[track.id]?.muted" class="fas fa-volume-xmark"></i>
                    <span v-else>M</span>
                  </button>

                  <button
                    @click="toggleSolo(track.id)"
                    :class="[
                      'px-4 py-2 rounded-md transition-colors text-sm font-medium',
                      trackStates[track.id]?.solo
                        ? 'bg-green-400/70 text-white'
                        : 'bg-neutral-700 text-neutral-400 hover:text-neutral-200'
                    ]"
                    :title="trackStates[track.id]?.solo ? 'Отключить Solo' : 'Solo'"
                  >
                    <i v-if="trackStates[track.id]?.solo" class="fas fa-headphones"></i>
                    <span v-else>S</span>
                  </button>
                </div>

                <!-- Track Name -->
                <h3 class="font-semibold text-sm">{{ track.name }}</h3>
                
                <!-- Loading indicator -->
                <div v-if="trackStates[track.id]?.loadingProgress < 100" class="mt-1">
                  <div class="flex items-center gap-2 text-xs text-neutral-400">
                    <div class="w-24 h-1.5 bg-neutral-700 rounded-xl overflow-hidden">
                      <div 
                        class="h-full bg-neutral-400 transition-all duration-300"
                        :style="{ width: trackStates[track.id]?.loadingProgress + '%' }"
                      ></div>
                    </div>
                    <span class="text-right">{{ trackStates[track.id]?.loadingProgress }}%</span>
                  </div>
                </div>
              </div>

              <!-- Right: Volume Control -->
              <div class="flex-1 flex items-center justify-end">
                <input
                  type="range"
                  min="0"
                  max="100"
                  :value="trackStates[track.id]?.volume || 100"
                  @input="setVolume(track.id, $event.target.value)"
                  class="w-full h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div
            class="relative h-1.5 bg-neutral-700 rounded-full cursor-pointer overflow-hidden"
            @click="seek"
            ref="progressBar"
          >
            <div
              class="absolute h-full bg-neutral-300 rounded-full transition-all"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-neutral-500 mt-2">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- Main Controls -->
        <div class="flex items-center justify-center gap-6">
          <button
            @click="stop"
            class="px-6 py-2.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors text-sm"
            :disabled="!isReady"
            title="Стоп"
          >
            <i class="fas fa-stop"></i>
          </button>

          <button
            @click="togglePlayPause"
            class="px-6 py-2.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors text-sm"
            :disabled="!isReady"
          >
            <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Version (Winamp Style) -->
    <div v-else class="p-2">
      <!-- Error State -->
      <div v-if="error" class="bg-red-900 border border-red-600 rounded p-2 mb-2 text-xs">
        <i class="fas fa-exclamation-triangle mr-1"></i>
        {{ error }}
      </div>

      <!-- Tracks -->
      <div class="space-y-2 mb-2">
        <div
          v-for="track in tracks"
          :key="track.id"
          class="border-2 border-gray-600 rounded p-1.5"
          style="background: linear-gradient(to right, #374151 0%, #1e3a8a 35%, #1e3a8a 65%, #1f2937 100%)"
        >
          <!-- Track Name and Controls -->
          <div class="flex items-center gap-2 mb-1">
            <!-- M/S Buttons -->
            <button
              @click="toggleMute(track.id)"
              :class="[
                'w-12 h-10 rounded border-2 text-base font-bold transition-colors',
                trackStates[track.id]?.muted
                  ? 'bg-red-400/70 border-red-600 text-white'
                  : 'bg-gray-400 border-gray-600 text-gray-800'
              ]"
            >
              <i v-if="trackStates[track.id]?.muted" class="fas fa-volume-xmark"></i>
              <span v-else>M</span>
            </button>

            <button
              @click="toggleSolo(track.id)"
              :class="[
                'w-12 h-10 rounded border-2 text-base font-bold transition-colors',
                trackStates[track.id]?.solo
                  ? 'bg-green-400/70 border-green-600 text-white'
                  : 'bg-gray-400 border-gray-600 text-gray-800'
              ]"
            >
              <i v-if="trackStates[track.id]?.solo" class="fas fa-headphones"></i>
              <span v-else>S</span>
            </button>

            <!-- Volume Level Bars -->
            <div 
              class="flex gap-0.5 items-end h-10 flex-[3] cursor-pointer" 
              @mousedown="startDrag(track.id, $event)"
              @touchstart="startDrag(track.id, $event)"
            >
              <div 
                v-for="i in 16" 
                :key="i"
                class="flex-1 rounded-sm transition-all"
                :class="[
                  (trackStates[track.id]?.volume || 100) >= (i * 6.25)
                    ? 'bg-lime-500'
                    : 'bg-gray-700'
                ]"
                :style="{ height: (2 + i * 2) + 'px' }"
              ></div>
            </div>

            <!-- Track Name -->
            <div class="text-base text-amber-200 font-bold w-20 text-right truncate">{{ track.name }}</div>
          </div>

          <!-- Loading Progress -->
          <div v-if="trackStates[track.id]?.loadingProgress < 100" class="mt-1">
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1 bg-gray-700 rounded overflow-hidden">
                <div 
                  class="h-full bg-lime-500 transition-all duration-300"
                  :style="{ width: trackStates[track.id]?.loadingProgress + '%' }"
                ></div>
              </div>
              <span class="text-xs text-lime-500">{{ trackStates[track.id]?.loadingProgress }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="bg-black border-2 border-gray-600 rounded p-2 mb-2">
        <div class="flex justify-between text-lime-500 text-xs mb-1 font-mono">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
        <div
          class="relative h-3 bg-gray-900 border border-gray-700 rounded cursor-pointer overflow-hidden"
          @click="seek"
          ref="progressBar"
        >
          <div
            class="absolute h-full transition-all"
            :style="{ 
              width: progressPercent + '%',
              background: 'linear-gradient(to right, #f97316, #84cc16)'
            }"
          ></div>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex gap-2 justify-center">
        <button
          @click="stop"
          class="px-6 py-2 bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-900 rounded font-bold hover:from-gray-500 hover:to-gray-700 disabled:opacity-50 text-white"
          :disabled="!isReady"
        >
          <i class="fas fa-stop text-base"></i>
          <span class="ml-1 text-base">Стоп</span>
        </button>

        <button
          @click="togglePlayPause"
          class="px-6 py-2 bg-gradient-to-b from-gray-600 to-gray-800 border-2 border-gray-900 rounded font-bold hover:from-gray-500 hover:to-gray-700 disabled:opacity-50 text-white"
          :disabled="!isReady"
        >
          <i :class="isPlaying ? 'fas fa-pause text-base' : 'fas fa-play text-base'"></i>
          <span class="ml-1 text-base">{{ isPlaying ? 'Пауза' : 'Плей' }}</span>
        </button>
      </div>
    </div>
  `,
  
  setup(props, { emit }) {
    // State
    const loadingProgress = ref(0);
    const error = ref(null);
    const isReady = ref(false);
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const progressPercent = ref(0);
    const progressBar = ref(null);

    // Audio Context
    let audioContext = null;
    let audioBuffers = {};
    let audioSources = {};
    let gainNodes = {};
    let startTime = 0;
    let pauseTime = 0;
    let animationFrameId = null;

    // Track States
    const trackStates = reactive({});

    // Initialize track states
    const initTrackStates = () => {
      props.tracks.forEach(track => {
        trackStates[track.id] = {
          volume: 100,
          muted: false,
          solo: false,
          loadingProgress: 0
        };
      });
    };

    // Load audio files
    const loadAudioFiles = async () => {
      try {
        error.value = null;
        
        console.log('Starting to load tracks:', props.tracks);
        
        if (!props.tracks || props.tracks.length === 0) {
          throw new Error('Нет треков для загрузки');
        }
        
        const missingHash = props.tracks.find(t => !t.fileHash);
        if (missingHash) {
          console.error('Track without fileHash:', missingHash);
          throw new Error(`Трек "${missingHash.name}" не имеет аудиофайла`);
        }
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🎵 AudioContext created, state:', audioContext.state);
        
        const totalTracks = props.tracks.length;
        let loadedTracks = 0;

        for (const track of props.tracks) {
          const url = $getFileUrl(track.fileHash);
          console.log(`Loading track "${track.name}" from:`, url);
          
          trackStates[track.id].loadingProgress = 0;
          
          const response = await fetch(url);
          
          if (!response.ok) {
            console.error(`Failed to fetch track "${track.name}":`, response.status, response.statusText);
            throw new Error(`Ошибка загрузки трека "${track.name}" (HTTP ${response.status})`);
          }

          const contentLength = response.headers.get('content-length');
          const total = parseInt(contentLength, 10);
          
          const reader = response.body.getReader();
          let receivedLength = 0;
          let chunks = [];
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            chunks.push(value);
            receivedLength += value.length;
            
            if (total) {
              trackStates[track.id].loadingProgress = Math.round((receivedLength / total) * 100);
            }
          }
          
          let allChunks = new Uint8Array(receivedLength);
          let position = 0;
          for (let chunk of chunks) {
            allChunks.set(chunk, position);
            position += chunk.length;
          }
          
          const arrayBuffer = allChunks.buffer;
          console.log(`Track "${track.name}" downloaded, size:`, arrayBuffer.byteLength);
          
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          console.log(`Track "${track.name}" decoded, duration:`, audioBuffer.duration);
          
          audioBuffers[track.id] = audioBuffer;
          trackStates[track.id].loadingProgress = 100;
          
          if (audioBuffer.duration > duration.value) {
            duration.value = audioBuffer.duration;
          }

          loadedTracks++;
          loadingProgress.value = Math.round((loadedTracks / totalTracks) * 100);
        }

        console.log('✅ All tracks loaded successfully');
        console.log('🎵 AudioContext state after load:', audioContext.state);
        isReady.value = true;
        emit('ready', true);
      } catch (err) {
        error.value = err.message || 'Ошибка загрузки аудио файлов';
        console.error('Audio loading error:', err);
      }
    };

    // Create and start audio sources
    const createSources = (offset = 0) => {
      if (!audioContext || audioContext.state !== 'running') {
        console.warn('⚠️ Cannot create sources - context not running');
        return;
      }
      
      let startedCount = 0;
      props.tracks.forEach(track => {
        if (!audioBuffers[track.id]) return;
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffers[track.id];
        
        const gainNode = audioContext.createGain();
        updateGainNode(track.id, gainNode);
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.start(0, offset);
        
        audioSources[track.id] = source;
        gainNodes[track.id] = gainNode;
        startedCount++;
        
        source.onended = () => {
          if (isPlaying.value) {
            stop();
          }
        };
      });
      console.log(`🎵 Started ${startedCount} tracks`);
    };

    // Update gain node based on track state
    const updateGainNode = (trackId, gainNode = null) => {
      const node = gainNode || gainNodes[trackId];
      if (!node) return;

      const state = trackStates[trackId];
      const hasSolo = Object.values(trackStates).some(s => s.solo);
      
      let volume = state.volume / 100;
      
      if (state.muted) {
        volume = 0;
      } else if (hasSolo && !state.solo) {
        volume = 0;
      }
      
      node.gain.value = volume;
    };

    // Update all gain nodes
    const updateAllGainNodes = () => {
      props.tracks.forEach(track => {
        updateGainNode(track.id);
      });
    };

    // Toggle play/pause
    const togglePlayPause = async () => {
      if (!isReady.value) return;

      if (isPlaying.value) {
        pause();
      } else {
        await play();
      }
    };

    // Play
    const play = async () => {
      if (!audioContext) {
        console.error('❌ No audio context');
        return;
      }
      
      console.log('🔊 Play clicked, AudioContext state:', audioContext.state);
      
      if (audioContext.state === 'suspended') {
        console.log('🎵 Активируем аудио контекст...');
        try {
          await audioContext.resume();
          console.log('✅ Аудио контекст активирован:', audioContext.state);
        } catch (err) {
          console.error('❌ Failed to resume:', err);
          error.value = 'Нажмите на кнопку Плей ещё раз';
          return;
        }
      }
      
      if (audioContext.state !== 'running') {
        console.warn('⚠️ AudioContext not running:', audioContext.state);
        return;
      }

      const offset = pauseTime;
      createSources(offset);
      startTime = audioContext.currentTime - offset;
      isPlaying.value = true;
      updateProgress();
    };

    // Pause
    const pause = () => {
      if (!isPlaying.value) return;

      pauseTime = audioContext.currentTime - startTime;
      stopSources();
      isPlaying.value = false;
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    // Stop
    const stop = () => {
      stopSources();
      isPlaying.value = false;
      pauseTime = 0;
      currentTime.value = 0;
      progressPercent.value = 0;
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    // Stop all sources
    const stopSources = () => {
      Object.values(audioSources).forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Source already stopped
        }
      });
      audioSources = {};
      gainNodes = {};
    };

    // Update progress
    const updateProgress = () => {
      if (!isPlaying.value) return;

      const elapsed = audioContext.currentTime - startTime;
      currentTime.value = Math.min(elapsed, duration.value);
      progressPercent.value = (currentTime.value / duration.value) * 100;

      if (currentTime.value >= duration.value) {
        stop();
      } else {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    // Seek
    const seek = (event) => {
      if (!isReady.value) return;

      const rect = progressBar.value.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percent * duration.value;

      const wasPlaying = isPlaying.value;
      
      if (isPlaying.value) {
        isPlaying.value = false;
      }
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      stopSources();

      pauseTime = newTime;
      currentTime.value = newTime;
      progressPercent.value = percent * 100;

      if (wasPlaying) {
        setTimeout(async () => {
          if (audioContext.state === 'suspended') {
            console.log('🎵 Активируем аудио контекст (seek)...');
            await audioContext.resume();
            console.log('✅ Аудио контекст активирован:', audioContext.state);
          }

          createSources(newTime);
          startTime = audioContext.currentTime - newTime;
          isPlaying.value = true;
          updateProgress();
        }, 10);
      }
    };

    // Set volume
    const setVolume = (trackId, value) => {
      trackStates[trackId].volume = parseInt(value);
      updateGainNode(trackId);
    };

    // Drag state
    let isDragging = false;
    let currentDragTrackId = null;

    // Start drag
    const startDrag = (trackId, event) => {
      isDragging = true;
      currentDragTrackId = trackId;
      updateVolumeFromDrag(event);
      
      const handleMove = (e) => {
        if (isDragging) {
          updateVolumeFromDrag(e);
        }
      };
      
      const handleEnd = () => {
        isDragging = false;
        currentDragTrackId = null;
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
    };

    // Update volume from drag
    const updateVolumeFromDrag = (event) => {
      if (!currentDragTrackId) return;
      
      const container = event.currentTarget || document.elementFromPoint(
        event.touches ? event.touches[0].clientX : event.clientX,
        event.touches ? event.touches[0].clientY : event.clientY
      )?.closest('.flex.gap-0\.5');
      
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const x = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const volume = Math.round(percent * 100);
      setVolume(currentDragTrackId, volume);
    };

    // Toggle mute
    const toggleMute = (trackId) => {
      trackStates[trackId].muted = !trackStates[trackId].muted;
      updateGainNode(trackId);
    };

    // Toggle solo
    const toggleSolo = (trackId) => {
      trackStates[trackId].solo = !trackStates[trackId].solo;
      updateAllGainNodes();
    };

    // Format time
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Unlock audio context on first interaction
    const unlockAudioContext = async () => {
      if (audioContext && audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
          console.log('🔓 AudioContext unlocked, state:', audioContext.state);
        } catch (err) {
          console.error('Failed to unlock:', err);
        }
      }
    };

    // Lifecycle
    onMounted(() => {
      initTrackStates();
      loadAudioFiles();
      
      // Add unlock listeners
      document.addEventListener('click', unlockAudioContext, { once: true });
      document.addEventListener('touchstart', unlockAudioContext, { once: true });
    });

    onUnmounted(() => {
      document.removeEventListener('click', unlockAudioContext);
      document.removeEventListener('touchstart', unlockAudioContext);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      stopSources();
      if (audioContext) {
        audioContext.close();
      }
    });

    // Watch for track changes
    watch(() => props.tracks, () => {
      stop();
      initTrackStates();
      loadAudioFiles();
    }, { deep: true });
    
    return {
      error,
      isReady,
      isPlaying,
      currentTime,
      duration,
      progressPercent,
      progressBar,
      trackStates,
      togglePlayPause,
      stop,
      seek,
      setVolume,
      toggleMute,
      toggleSolo,
      formatTime,
      startDrag
    };
  }
};
