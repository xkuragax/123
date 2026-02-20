// 🎵 MultitrackPlayer - Многодорожечный аудио плеер

class MultitrackPlayer {
  constructor(containerId, tracks, options = {}) {
    this.container = document.getElementById(containerId);
    this.tracks = tracks;
    this.baseUrl = options.baseUrl || '/uploads';
    this.songTitle = options.songTitle || 'Без названия';
    
    this.audioContext = null;
    this.audioBuffers = [];
    this.sourceNodes = [];
    this.gainNodes = [];
    this.muteStates = [];
    this.soloTrack = null;
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseTime = 0;
    this.duration = 0;
    this.loadedCount = 0;
    
    this.init();
  }

  async init() {
    this.render();
    await this.initAudioContext();
    await this.loadAudioFiles();
    
    // Добавляем обработчик для разблокировки AudioContext при первом клике
    this.unlockAudioContext = this.unlockAudioContext.bind(this);
    document.addEventListener('click', this.unlockAudioContext, { once: true });
    document.addEventListener('touchstart', this.unlockAudioContext, { once: true });
  }
  
  async unlockAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('🔓 AudioContext unlocked by user interaction, state:', this.audioContext.state);
      } catch (err) {
        console.error('Failed to unlock audio context:', err);
      }
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="multitrack-player" style="
        background: var(--surface);
        border-radius: 1rem;
        padding: 1rem;
        border: 1px solid var(--border);
      ">
        <!-- Заголовок -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 style="margin: 0;">🎧 ${this.songTitle}</h3>
            <small id="loading-status" class="text-muted">Загрузка аудио...</small>
          </div>
          <button id="close-player" class="btn btn-secondary btn-sm" onclick="app.player.destroy()">
            <i class="fas fa-times"></i> Закрыть
          </button>
        </div>

        <!-- Прогресс загрузки -->
        <div id="loading-bar" style="
          width: 100%;
          height: 4px;
          background: var(--surface-light);
          border-radius: 2px;
          margin-bottom: 1rem;
          overflow: hidden;
        ">
          <div id="loading-progress" style="
            width: 0%;
            height: 100%;
            background: var(--primary);
            transition: width 0.3s;
          "></div>
        </div>

        <!-- Основные кнопки -->
        <div style="display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem;">
          <button id="btn-stop" class="btn btn-secondary" disabled>
            <i class="fas fa-stop"></i>
          </button>
          <button id="btn-play" class="btn btn-primary" style="padding: 0.75rem 2rem;" disabled>
            <i class="fas fa-play"></i> Играть
          </button>
        </div>

        <!-- Прогресс воспроизведения -->
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.5rem;">
            <span id="current-time">0:00</span>
            <span id="total-time">0:00</span>
          </div>
          <input type="range" id="progress-bar" min="0" max="100" value="0" style="
            width: 100%;
            height: 8px;
            -webkit-appearance: none;
            appearance: none;
            background: var(--surface-light);
            border-radius: 4px;
            outline: none;
            cursor: pointer;
          " disabled>
        </div>

        <!-- Треки -->
        <div id="tracks-container" style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${this.tracks.map((track, index) => `
            <div class="track-control" data-index="${index}" style="
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 0.75rem;
              background: var(--surface-light);
              border-radius: 0.5rem;
              border-left: 4px solid ${track.color || '#3b82f6'};
            ">
              <button class="btn-mute btn-sm" data-index="${index}" style="
                padding: 0.25rem 0.5rem;
                border: none;
                border-radius: 0.25rem;
                background: var(--surface);
                color: var(--text);
                cursor: pointer;
                font-size: 0.75rem;
              ">MUTE</button>
              
              <button class="btn-solo btn-sm" data-index="${index}" style="
                padding: 0.25rem 0.5rem;
                border: none;
                border-radius: 0.25rem;
                background: var(--surface);
                color: var(--text);
                cursor: pointer;
                font-size: 0.75rem;
              ">SOLO</button>
              
              <div style="flex: 1; font-weight: 500;">${track.name}</div>
              
              <input type="range" class="volume-slider" data-index="${index}" min="0" max="100" value="100" style="
                width: 100px;
                height: 4px;
                -webkit-appearance: none;
                appearance: none;
                background: var(--border);
                border-radius: 2px;
                outline: none;
              ">
              
              <span class="volume-value" style="font-size: 0.875rem; min-width: 3rem; text-align: right;">100%</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Стили для ползунков
    const style = document.createElement('style');
    style.textContent = `
      .multitrack-player input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: var(--primary);
        border-radius: 50%;
        cursor: pointer;
      }
      .multitrack-player input[type="range"]::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: var(--primary);
        border-radius: 50%;
        cursor: pointer;
        border: none;
      }
      .multitrack-player .btn-mute.active {
        background: var(--danger) !important;
      }
      .multitrack-player .btn-solo.active {
        background: var(--warning) !important;
        color: var(--background) !important;
      }
    `;
    document.head.appendChild(style);

    // Обработчики
    this.bindEvents();
  }

  bindEvents() {
    // Play/Pause
    document.getElementById('btn-play').addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    });

    // Stop
    document.getElementById('btn-stop').addEventListener('click', () => {
      this.stop();
    });

    // Seek
    const progressBar = document.getElementById('progress-bar');
    progressBar.addEventListener('input', (e) => {
      const percent = e.target.value / 100;
      const newTime = this.duration * percent;
      this.seek(newTime);
    });

    // Mute/Solo/Volume для каждого трека
    this.tracks.forEach((_, index) => {
      const muteBtn = document.querySelector(`.btn-mute[data-index="${index}"]`);
      const soloBtn = document.querySelector(`.btn-solo[data-index="${index}"]`);
      const volumeSlider = document.querySelector(`.volume-slider[data-index="${index}"]`);

      muteBtn.addEventListener('click', () => this.toggleMute(index));
      soloBtn.addEventListener('click', () => this.toggleSolo(index));
      volumeSlider.addEventListener('input', (e) => this.setVolume(index, e.target.value / 100));
    });
  }

  async initAudioContext() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('🎵 AudioContext created, initial state:', this.audioContext.state);
    
    // Возобновляем контекст если он приостановлен
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('✅ AudioContext resumed, state:', this.audioContext.state);
      } catch (err) {
        console.warn('⚠️ Could not resume AudioContext immediately:', err);
      }
    }
  }

  async loadAudioFiles() {
    this.loadedCount = 0;
    
    for (let i = 0; i < this.tracks.length; i++) {
      try {
        const track = this.tracks[i];
        const response = await fetch(`${this.baseUrl}/${track.file_hash}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        this.audioBuffers[i] = audioBuffer;
        this.loadedCount++;
        
        // Обновляем длительность
        if (audioBuffer.duration > this.duration) {
          this.duration = audioBuffer.duration;
        }
        
        this.updateLoadingProgress();
      } catch (error) {
        console.error(`Ошибка загрузки трека ${i}:`, error);
      }
    }

    // Создаем gain nodes
    this.tracks.forEach((_, index) => {
      this.gainNodes[index] = this.audioContext.createGain();
      this.gainNodes[index].gain.value = 1;
      this.gainNodes[index].connect(this.audioContext.destination);
      this.muteStates[index] = false;
    });

    // Готово к воспроизведению
    document.getElementById('loading-status').textContent = 'Готово к воспроизведению';
    document.getElementById('btn-play').disabled = false;
    document.getElementById('btn-stop').disabled = false;
    document.getElementById('progress-bar').disabled = false;
    document.getElementById('total-time').textContent = this.formatTime(this.duration);
  }

  updateLoadingProgress() {
    const percent = (this.loadedCount / this.tracks.length) * 100;
    document.getElementById('loading-progress').style.width = `${percent}%`;
  }

  async play() {
    if (!this.audioContext) {
      console.error('❌ No audio context available');
      return;
    }
    
    console.log('🔊 Play clicked, AudioContext state:', this.audioContext.state);
    
    // Возобновляем контекст (ОБЯЗАТЕЛЬНО ждём!)
    if (this.audioContext.state === 'suspended') {
      console.log('🎵 Активируем аудио контекст...');
      try {
        await this.audioContext.resume();
        console.log('✅ Аудио контекст активирован:', this.audioContext.state);
      } catch (err) {
        console.error('❌ Failed to resume audio context:', err);
        alert('Нажмите на кнопку Плей ещё раз для запуска звука');
        return;
      }
    }
    
    // Проверяем, что контекст действительно запущен
    if (this.audioContext.state !== 'running') {
      console.warn('⚠️ AudioContext not running, state:', this.audioContext.state);
      return;
    }

    // Останавливаем текущее воспроизведение
    this.stopSources();

    // Создаем новые source nodes
    this.sourceNodes = [];
    let startedCount = 0;
    this.tracks.forEach((_, index) => {
      if (!this.audioBuffers[index]) return;
      
      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffers[index];
      source.connect(this.gainNodes[index]);
      
      // Учитываем mute/solo
      this.updateGain(index);
      
      const offset = this.pauseTime;
      
      // Проверяем состояние перед стартом
      if (this.audioContext.state === 'running') {
        source.start(0, offset);
        this.sourceNodes[index] = source;
        startedCount++;
      } else {
        console.warn(`⚠️ Cannot start track ${index} - context not running`);
      }
    });
    console.log(`🎵 Started ${startedCount} tracks`);

    this.startTime = this.audioContext.currentTime - this.pauseTime;
    this.isPlaying = true;
    
    // Обновляем UI
    document.getElementById('btn-play').innerHTML = '<i class="fas fa-pause"></i> Пауза';
    
    // Запускаем обновление прогресса
    this.startProgressUpdate();
  }

  pause() {
    this.pauseTime = this.audioContext.currentTime - this.startTime;
    this.stopSources();
    this.isPlaying = false;
    
    document.getElementById('btn-play').innerHTML = '<i class="fas fa-play"></i> Играть';
    this.stopProgressUpdate();
  }

  stop() {
    this.stopSources();
    this.pauseTime = 0;
    this.isPlaying = false;
    
    document.getElementById('btn-play').innerHTML = '<i class="fas fa-play"></i> Играть';
    document.getElementById('progress-bar').value = 0;
    document.getElementById('current-time').textContent = '0:00';
    
    this.stopProgressUpdate();
  }

  stopSources() {
    this.sourceNodes.forEach(source => {
      if (source) {
        try {
          source.stop();
        } catch (e) {}
      }
    });
    this.sourceNodes = [];
  }

  async seek(time) {
    const wasPlaying = this.isPlaying;
    this.pauseTime = time;
    
    if (wasPlaying) {
      await this.play();
    } else {
      this.updateProgressDisplay();
    }
  }

  toggleMute(index) {
    this.muteStates[index] = !this.muteStates[index];
    
    const btn = document.querySelector(`.btn-mute[data-index="${index}"]`);
    btn.classList.toggle('active', this.muteStates[index]);
    
    this.updateGain(index);
  }

  toggleSolo(index) {
    if (this.soloTrack === index) {
      // Выключить solo
      this.soloTrack = null;
    } else {
      // Включить solo
      this.soloTrack = index;
    }
    
    // Обновить UI
    document.querySelectorAll('.btn-solo').forEach((btn, i) => {
      btn.classList.toggle('active', this.soloTrack === i);
    });
    
    // Обновить громкость всех треков
    this.tracks.forEach((_, i) => this.updateGain(i));
  }

  setVolume(index, value) {
    const volumeValue = document.querySelector(`.volume-value[data-index="${index}"]`);
    if (volumeValue) {
      volumeValue.textContent = `${Math.round(value * 100)}%`;
    }
    
    this.updateGain(index);
  }

  updateGain(index) {
    if (!this.gainNodes[index]) return;
    
    const volumeSlider = document.querySelector(`.volume-slider[data-index="${index}"]`);
    const volume = volumeSlider ? parseInt(volumeSlider.value) / 100 : 1;
    
    let gain = volume;
    
    // Если solo включен
    if (this.soloTrack !== null) {
      if (this.soloTrack === index) {
        gain = volume; // Solo track играет
      } else {
        gain = 0; // Остальные muted
      }
    } else {
      // Solo не включен, проверяем mute
      if (this.muteStates[index]) {
        gain = 0;
      }
    }
    
    this.gainNodes[index].gain.value = gain;
  }

  startProgressUpdate() {
    this.stopProgressUpdate();
    this.progressInterval = setInterval(() => this.updateProgress(), 100);
  }

  stopProgressUpdate() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  updateProgress() {
    if (!this.isPlaying) return;
    
    const currentTime = this.audioContext.currentTime - this.startTime;
    
    if (currentTime >= this.duration) {
      this.stop();
      return;
    }
    
    this.pauseTime = currentTime;
    this.updateProgressDisplay();
  }

  updateProgressDisplay() {
    const percent = (this.pauseTime / this.duration) * 100;
    document.getElementById('progress-bar').value = percent;
    document.getElementById('current-time').textContent = this.formatTime(this.pauseTime);
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  destroy() {
    document.removeEventListener('click', this.unlockAudioContext);
    document.removeEventListener('touchstart', this.unlockAudioContext);
    
    this.stop();
    this.stopProgressUpdate();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.container.classList.add('hidden');
    document.getElementById('player-container').classList.add('hidden');
    
    // Удаляем стили
    const style = document.querySelector('style');
    if (style && style.textContent.includes('multitrack-player')) {
      style.remove();
    }
  }
}
