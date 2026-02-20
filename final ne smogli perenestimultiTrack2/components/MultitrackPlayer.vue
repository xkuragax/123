<template>
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
              
              <!-- Loading indicator for this track -->
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

          <!-- Volume Level Bars (green) -->
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
        <!-- Orange/Green gradient progress -->
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
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
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
})

const emit = defineEmits(['ready'])

// State
const loadingProgress = ref(0)
const error = ref(null)
const isReady = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progressPercent = ref(0)
const progressBar = ref(null)

// Audio Context
let audioContext = null
let audioBuffers = {}
let audioSources = {}
let gainNodes = {}
let startTime = 0
let pauseTime = 0
let animationFrameId = null

// Track States
const trackStates = reactive({})

// Initialize track states
const initTrackStates = () => {
  props.tracks.forEach(track => {
    trackStates[track.id] = {
      volume: 100,
      muted: false,
      solo: false,
      loadingProgress: 0
    }
  })
}

// Load audio files
const loadAudioFiles = async () => {
  try {
    error.value = null
    
    console.log('🎵 Starting to load tracks:', props.tracks)
    
    // Validate tracks
    if (!props.tracks || props.tracks.length === 0) {
      throw new Error('Нет треков для загрузки')
    }
    
    // Check for missing fileHash
    const missingHash = props.tracks.find(t => !t.fileHash)
    if (missingHash) {
      console.error('❌ Track without fileHash:', missingHash)
      throw new Error(`Трек "${missingHash.name}" не имеет аудиофайла`)
    }
    
    // Create audio context with better error handling
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('✅ AudioContext created, state:', audioContext.state)
    } catch (ctxErr) {
      console.error('❌ Failed to create AudioContext:', ctxErr)
      throw new Error('Браузер не поддерживает Web Audio API')
    }
    
    const totalTracks = props.tracks.length
    let loadedTracks = 0

    for (const track of props.tracks) {
      const url = `https://fs.chatium.ru/get/${track.fileHash}`
      console.log(`📥 Loading track "${track.name}" from:`, url)
      
      trackStates[track.id].loadingProgress = 0
      
      let response
      try {
        response = await fetch(url)
      } catch (fetchErr) {
        console.error(`❌ Network error fetching "${track.name}":`, fetchErr)
        throw new Error(`Ошибка сети при загрузке "${track.name}". Проверьте подключение.`)
      }
      
      if (!response.ok) {
        console.error(`❌ Failed to fetch track "${track.name}":`, response.status, response.statusText)
        throw new Error(`Ошибка загрузки трека "${track.name}" (HTTP ${response.status})`)
      }

      const contentLength = response.headers.get('content-length')
      const total = parseInt(contentLength, 10)
      
      // Read response with progress
      const reader = response.body.getReader()
      let receivedLength = 0
      let chunks = []
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        chunks.push(value)
        receivedLength += value.length
        
        // Update progress for this track
        if (total) {
          trackStates[track.id].loadingProgress = Math.round((receivedLength / total) * 100)
        }
      }
      
      // Combine chunks into single array
      let allChunks = new Uint8Array(receivedLength)
      let position = 0
      for (let chunk of chunks) {
        allChunks.set(chunk, position)
        position += chunk.length
      }
      
      const arrayBuffer = allChunks.buffer
      console.log(`✅ Track "${track.name}" downloaded, size:`, arrayBuffer.byteLength)
      
      let audioBuffer
      try {
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      } catch (decodeErr) {
        console.error(`❌ Failed to decode "${track.name}":`, decodeErr)
        throw new Error(`Ошибка декодирования аудио "${track.name}". Файл может быть повреждён.`)
      }
      
      console.log(`✅ Track "${track.name}" decoded, duration:`, audioBuffer.duration)
      
      audioBuffers[track.id] = audioBuffer
      trackStates[track.id].loadingProgress = 100
      
      // Update duration (use the longest track)
      if (audioBuffer.duration > duration.value) {
        duration.value = audioBuffer.duration
      }

      loadedTracks++
      loadingProgress.value = Math.round((loadedTracks / totalTracks) * 100)
    }

    console.log('✅ All tracks loaded successfully! Click Play to start.')
    console.log('🎵 AudioContext state after load:', audioContext.state)
    isReady.value = true
    emit('ready', true)
  } catch (err) {
    error.value = err.message || 'Ошибка загрузки аудио файлов'
    console.error('❌ Audio loading error:', err)
  }
}

// Create and start audio sources
const createSources = (offset = 0) => {
  if (!audioContext) {
    console.error('❌ No audioContext in createSources')
    return
  }

  if (audioContext.state !== 'running') {
    console.warn('⚠️ AudioContext not running in createSources, state:', audioContext.state)
  }

  let createdCount = 0
  
  props.tracks.forEach(track => {
    if (!audioBuffers[track.id]) {
      console.warn(`⚠️ No audio buffer for track ${track.id}`)
      return
    }
    
    try {
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffers[track.id]
      
      const gainNode = audioContext.createGain()
      updateGainNode(track.id, gainNode)
      
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Проверяем состояние перед стартом
      if (audioContext.state === 'running') {
        source.start(0, offset)
        console.log(`✅ Started track "${track.name}" from offset ${offset}`)
      } else {
        console.warn(`⚠️ Cannot start track "${track.name}" - context not running`)
      }
      
      audioSources[track.id] = source
      gainNodes[track.id] = gainNode
      createdCount++
      
      // Handle track end
      source.onended = () => {
        if (isPlaying.value) {
          stop()
        }
      }
    } catch (err) {
      console.error(`❌ Error creating source for track ${track.id}:`, err)
    }
  })

  console.log(`🎵 Created ${createdCount} audio sources`)
}

// Update gain node based on track state
const updateGainNode = (trackId, gainNode = null) => {
  const node = gainNode || gainNodes[trackId]
  if (!node) return

  const state = trackStates[trackId]
  const hasSolo = Object.values(trackStates).some(s => s.solo)
  
  let volume = state.volume / 100
  
  if (state.muted) {
    volume = 0
  } else if (hasSolo && !state.solo) {
    volume = 0
  }
  
  node.gain.value = volume
}

// Update all gain nodes
const updateAllGainNodes = () => {
  props.tracks.forEach(track => {
    updateGainNode(track.id)
  })
}

// Toggle play/pause
const togglePlayPause = async () => {
  if (!isReady.value) return

  if (isPlaying.value) {
    pause()
  } else {
    await play()
  }
}

// Play
const play = async () => {
  if (!audioContext) {
    error.value = 'Аудио контекст не инициализирован'
    return
  }

  console.log('🔊 Play clicked, AudioContext state:', audioContext.state)

  // Браузер требует пользовательского взаимодействия
  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume()
      console.log('✅ AudioContext resumed, new state:', audioContext.state)
    } catch (err) {
      console.error('❌ Failed to resume audio context:', err)
      error.value = 'Нажмите на кнопку Плей ещё раз для запуска звука'
      return
    }
  }

  // Если всё ещё suspended - показываем подсказку
  if (audioContext.state !== 'running') {
    console.warn('⚠️ AudioContext not running, state:', audioContext.state)
    error.value = 'Нажмите на кнопку Плей для включения звука'
    // Пробуем ещё раз через пользовательское событие
    try {
      await audioContext.resume()
    } catch (e) {
      console.error('Second resume attempt failed:', e)
    }
    return
  }

  const offset = pauseTime
  console.log('🎵 Starting playback from offset:', offset)
  createSources(offset)
  startTime = audioContext.currentTime - offset
  isPlaying.value = true
  updateProgress()
}

// Pause
const pause = () => {
  if (!isPlaying.value) return

  pauseTime = audioContext.currentTime - startTime
  stopSources()
  isPlaying.value = false
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

// Stop
const stop = () => {
  stopSources()
  isPlaying.value = false
  pauseTime = 0
  currentTime.value = 0
  progressPercent.value = 0
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

// Stop all sources
const stopSources = () => {
  Object.values(audioSources).forEach(source => {
    try {
      source.stop()
    } catch (e) {
      // Source already stopped
    }
  })
  audioSources = {}
  gainNodes = {}
}

// Update progress
const updateProgress = () => {
  if (!isPlaying.value) return

  const elapsed = audioContext.currentTime - startTime
  currentTime.value = Math.min(elapsed, duration.value)
  progressPercent.value = (currentTime.value / duration.value) * 100

  if (currentTime.value >= duration.value) {
    stop()
  } else {
    animationFrameId = requestAnimationFrame(updateProgress)
  }
}

// Seek
const seek = async (event) => {
  if (!isReady.value || !audioContext) return

  const rect = progressBar.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const percent = Math.max(0, Math.min(1, x / rect.width))
  const newTime = percent * duration.value

  const wasPlaying = isPlaying.value
  
  // Stop everything
  if (isPlaying.value) {
    isPlaying.value = false
  }
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  
  stopSources()

  // Set new position
  pauseTime = newTime
  currentTime.value = newTime
  progressPercent.value = percent * 100

  // If was playing, restart immediately
  if (wasPlaying) {
    // Small delay to ensure sources are fully stopped
    setTimeout(async () => {
      if (!audioContext) return
      
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume()
        } catch (err) {
          console.error('Failed to resume audio context on seek:', err)
          return
        }
      }

      // Проверяем состояние перед созданием источников
      if (audioContext.state !== 'running') {
        console.warn('⚠️ Cannot restart after seek - context not running')
        return
      }

      createSources(newTime)
      startTime = audioContext.currentTime - newTime
      isPlaying.value = true
      updateProgress()
    }, 10)
  }
}

// Set volume
const setVolume = (trackId, value) => {
  trackStates[trackId].volume = parseInt(value)
  updateGainNode(trackId)
}

// Handle volume bar click (for mobile)
const handleVolumeBarClick = (trackId, event) => {
  const container = event.currentTarget
  const rect = container.getBoundingClientRect()
  const x = event.clientX - rect.left
  const percent = Math.max(0, Math.min(1, x / rect.width))
  const volume = Math.round(percent * 100)
  setVolume(trackId, volume)
}

// Drag state
let isDragging = false
let currentDragTrackId = null

// Start drag
const startDrag = (trackId, event) => {
  isDragging = true
  currentDragTrackId = trackId
  updateVolumeFromDrag(event)
  
  const handleMove = (e) => {
    if (isDragging) {
      updateVolumeFromDrag(e)
    }
  }
  
  const handleEnd = () => {
    isDragging = false
    currentDragTrackId = null
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}

// Update volume from drag
const updateVolumeFromDrag = (event) => {
  if (!currentDragTrackId) return
  
  const container = event.currentTarget || document.elementFromPoint(
    event.touches ? event.touches[0].clientX : event.clientX,
    event.touches ? event.touches[0].clientY : event.clientY
  )?.closest('.flex.gap-0\.5')
  
  if (!container) return
  
  const rect = container.getBoundingClientRect()
  const x = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left
  const percent = Math.max(0, Math.min(1, x / rect.width))
  const volume = Math.round(percent * 100)
  setVolume(currentDragTrackId, volume)
}

// Toggle mute
const toggleMute = (trackId) => {
  trackStates[trackId].muted = !trackStates[trackId].muted
  updateGainNode(trackId)
}

// Toggle solo
const toggleSolo = (trackId) => {
  trackStates[trackId].solo = !trackStates[trackId].solo
  updateAllGainNodes()
}

// Format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Unlock audio context on first user interaction
const unlockAudioContext = async () => {
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume()
      console.log('🔓 AudioContext unlocked by user interaction, state:', audioContext.state)
    } catch (err) {
      console.error('Failed to unlock audio context:', err)
    }
  }
}

// Lifecycle
onMounted(() => {
  initTrackStates()
  loadAudioFiles()
  
  // Add unlock listeners for user interaction
  document.addEventListener('click', unlockAudioContext, { once: true })
  document.addEventListener('touchstart', unlockAudioContext, { once: true })
})

onUnmounted(() => {
  document.removeEventListener('click', unlockAudioContext)
  document.removeEventListener('touchstart', unlockAudioContext)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  stopSources()
  if (audioContext) {
    audioContext.close()
  }
})

// Watch for track changes
watch(() => props.tracks, () => {
  stop()
  initTrackStates()
  loadAudioFiles()
}, { deep: true })
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  background: #d1d5db;
  cursor: pointer;
  border-radius: 50%;
}

.slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #d1d5db;
  cursor: pointer;
  border-radius: 50%;
  border: none;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>