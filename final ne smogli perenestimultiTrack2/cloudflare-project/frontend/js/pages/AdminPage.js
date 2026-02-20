const { ref, onMounted, computed } = Vue;
const { useRouter } = VueRouter;

export default {
  template: `
    <div class="min-h-screen bg-darker text-text-primary">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button v-if="currentView !== 'albums'" @click="goBack" class="text-accent hover:text-accent-hover">
              <i class="fas fa-arrow-left mr-2"></i>Назад
            </button>
            <h1 class="text-3xl font-bold">
              {{ viewTitle }}
            </h1>
          </div>
          <button @click="logout" class="text-text-secondary hover:text-red-400">
            <i class="fas fa-sign-out-alt mr-2"></i>Выйти
          </button>
        </div>

        <!-- Albums View -->
        <div v-if="currentView === 'albums'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">Альбомы</h2>
            <button @click="openAlbumModal()" class="btn-primary">
              <i class="fas fa-plus mr-2"></i>Добавить альбом
            </button>
          </div>
          
          <div ref="albumsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="album in albums" 
              :key="album.id" 
              :data-id="album.id"
              class="card cursor-move"
              draggable="true"
              @dragstart="handleDragStart($event, album.id)"
              @dragover="handleDragOver"
              @drop="handleDrop($event, album.id, 'albums')"
              @dragend="handleDragEnd"
            >
              <div @click="openAlbum(album)" class="cursor-pointer">
                <img v-if="album.cover_hash" :src="$getFileUrl(album.cover_hash)" class="w-full h-48 object-cover rounded-t-lg" />
                <div v-else class="w-full h-48 bg-dark rounded-t-lg flex items-center justify-center">
                  <i class="fas fa-image text-4xl text-muted"></i>
                </div>
                <div class="p-4">
                  <h3 class="text-lg font-semibold">{{ album.title }}</h3>
                  <p class="text-text-secondary">{{ album.artist }}</p>
                  <p class="text-sm text-muted">{{ album.year }}</p>
                </div>
              </div>
              <div class="flex space-x-2 p-4 pt-0">
                <button @click.stop="openAlbumModal(album)" class="btn-secondary flex-1">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click.stop="deleteAlbum(album.id)" class="btn-danger flex-1">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Songs View -->
        <div v-if="currentView === 'songs'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">Песни</h2>
            <button @click="openSongModal()" class="btn-primary">
              <i class="fas fa-plus mr-2"></i>Добавить песню
            </button>
          </div>

          <div ref="songsContainer" class="space-y-4">
            <div 
              v-for="song in songs" 
              :key="song.id"
              :data-id="song.id"
              class="card p-4 cursor-move"
              draggable="true"
              @dragstart="handleDragStart($event, song.id)"
              @dragover="handleDragOver"
              @drop="handleDrop($event, song.id, 'songs')"
              @dragend="handleDragEnd"
            >
              <div @click="openSong(song)" class="flex justify-between items-start cursor-pointer">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold">{{ song.title }}</h3>
                  <div class="flex space-x-4 mt-2">
                    <span v-if="song.lyrics" class="text-accent hover:text-accent-hover text-sm">
                      <i class="fas fa-align-left mr-1"></i>Текст
                    </span>
                    <a v-if="song.tabs_url" :href="song.tabs_url" target="_blank" class="text-accent hover:text-accent-hover text-sm" @click.stop>
                      <i class="fas fa-file-alt mr-1"></i>Табы
                    </a>
                    <span v-if="song.tracks_count > 0" class="text-green-500 text-sm">
                      <i class="fas fa-music mr-1"></i>{{ song.tracks_count }} стем
                    </span>
                    <span v-else class="text-red-500 text-sm">
                      <i class="fas fa-exclamation-circle mr-1"></i>нет стем
                    </span>
                  </div>
                </div>
                <div class="flex space-x-2 ml-4">
                  <button @click.stop="openSongModal(song)" class="btn-secondary">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click.stop="deleteSong(song.id)" class="btn-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tracks View -->
        <div v-if="currentView === 'tracks'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold">Стемы</h2>
            <button @click="openTrackModal()" class="btn-primary" :disabled="tracks.length >= 7">
              <i class="fas fa-plus mr-2"></i>Добавить стем
            </button>
          </div>

          <div v-if="tracks.length >= 7" class="bg-accent/10 border border-accent text-text-primary p-3 rounded-lg mb-4">
            <i class="fas fa-info-circle mr-2"></i>Максимум 7 стем на песню
          </div>

          <div ref="tracksContainer" class="space-y-4">
            <div 
              v-for="track in tracks" 
              :key="track.id"
              :data-id="track.id"
              class="card p-4 cursor-move"
              draggable="true"
              @dragstart="handleDragStart($event, track.id)"
              @dragover="handleDragOver"
              @drop="handleDrop($event, track.id, 'tracks')"
              @dragend="handleDragEnd"
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4 flex-1">
                  <div class="w-12 h-12 rounded" :style="{ backgroundColor: track.color || '#6366f1' }"></div>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold">{{ track.name }}</h3>
                    <audio v-if="track.file_hash" :src="$getFileUrl(track.file_hash)" controls class="mt-2 w-full max-w-md"></audio>
                  </div>
                </div>
                <div class="flex space-x-2 ml-4">
                  <button @click.stop="openTrackModal(track)" class="btn-secondary">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click.stop="deleteTrack(track.id)" class="btn-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Album Modal -->
      <div v-if="showAlbumModal" class="modal-overlay" @click="closeAlbumModal">
        <div class="modal-content" @click.stop>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold">{{ editingAlbum ? 'Редактировать альбом' : 'Добавить альбом' }}</h3>
            <button @click="closeAlbumModal" class="text-text-secondary hover:text-text-primary">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Название</label>
              <input v-model="albumForm.title" type="text" class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Исполнитель</label>
              <input v-model="albumForm.artist" type="text" class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Год</label>
              <input v-model="albumForm.year" type="number" class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Обложка</label>
              <div v-if="albumForm.cover_hash" class="mb-2">
                <img :src="$getFileUrl(albumForm.cover_hash)" class="w-32 h-32 object-cover rounded" />
              </div>
              <input type="file" @change="handleAlbumCoverUpload" accept="image/*" class="input-field" />
              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
                <div class="w-full bg-dark rounded-full h-2">
                  <div class="bg-accent h-2 rounded-full" :style="{ width: uploadProgress + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button @click="saveAlbum" class="btn-primary flex-1" :disabled="isSaving">
              <i class="fas fa-save mr-2"></i>{{ isSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button @click="closeAlbumModal" class="btn-secondary flex-1">
              Отмена
            </button>
          </div>
        </div>
      </div>

      <!-- Song Modal -->
      <div v-if="showSongModal" class="modal-overlay" @click="closeSongModal">
        <div class="modal-content" @click.stop>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold">{{ editingSong ? 'Редактировать песню' : 'Добавить песню' }}</h3>
            <button @click="closeSongModal" class="text-text-secondary hover:text-text-primary">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Название</label>
              <input v-model="songForm.title" type="text" class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Текст песни</label>
              <textarea v-model="songForm.lyrics" rows="6" class="input-field"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Ссылка на табы (Google Drive)</label>
              <input v-model="songForm.tabs_url" type="url" class="input-field" />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Ссылка на стемы (Google Drive)</label>
              <input v-model="songForm.stems_url" type="url" class="input-field" />
            </div>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button @click="saveSong" class="btn-primary flex-1" :disabled="isSaving">
              <i class="fas fa-save mr-2"></i>{{ isSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button @click="closeSongModal" class="btn-secondary flex-1">
              Отмена
            </button>
          </div>
        </div>
      </div>

      <!-- Track Modal -->
      <div v-if="showTrackModal" class="modal-overlay" @click="closeTrackModal">
        <div class="modal-content" @click.stop>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold">{{ editingTrack ? 'Редактировать стем' : 'Добавить стемы' }}</h3>
            <button @click="closeTrackModal" class="text-text-secondary hover:text-text-primary">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="space-y-4">
            <div v-if="editingTrack">
              <label class="block text-sm font-medium mb-2">Название</label>
              <input v-model="trackForm.name" type="text" class="input-field" placeholder="например, Бас, Гитара, Вокал..." />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">{{ editingTrack ? 'Аудиофайл' : 'Аудиофайлы (можно выбрать несколько)' }}</label>
              <div v-if="editingTrack && trackForm.file_hash" class="mb-2">
                <audio :src="$getFileUrl(trackForm.file_hash)" controls class="w-full"></audio>
              </div>
              <input 
                type="file" 
                @change="handleTrackFileUpload" 
                accept="audio/*" 
                :multiple="!editingTrack"
                class="input-field" 
              />
              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
                <div class="w-full bg-dark rounded-full h-2">
                  <div class="bg-accent h-2 rounded-full" :style="{ width: uploadProgress + '%' }"></div>
                </div>
                <p class="text-sm text-text-secondary mt-1 text-center">Загрузка... {{ uploadProgress }}%</p>
              </div>
              <div v-if="uploadingFiles.length > 0" class="mt-3 space-y-2">
                <div v-for="(file, idx) in uploadingFiles" :key="idx" class="text-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-text-secondary">{{ file.name }}</span>
                    <span class="text-accent">{{ file.status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button @click="saveTrack" class="btn-primary flex-1" :disabled="isSaving">
              <i class="fas fa-save mr-2"></i>{{ isSaving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button @click="closeTrackModal" class="btn-secondary flex-1">
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  
  setup() {
    const router = useRouter();
    
    const currentView = ref('albums');
    const albums = ref([]);
    const songs = ref([]);
    const tracks = ref([]);
    
    const currentAlbum = ref(null);
    const currentSong = ref(null);
    
    const showAlbumModal = ref(false);
    const showSongModal = ref(false);
    const showTrackModal = ref(false);
    
    const editingAlbum = ref(null);
    const editingSong = ref(null);
    const editingTrack = ref(null);
    
    const isSaving = ref(false);
    const uploadProgress = ref(0);
    const uploadingFiles = ref([]);
    const uploadedTracks = ref([]);
    
    const draggedItemId = ref(null);
    
    const albumForm = ref({
      title: '',
      artist: '',
      year: new Date().getFullYear(),
      cover_hash: ''
    });
    
    const songForm = ref({
      title: '',
      lyrics: '',
      tabs_url: '',
      stems_url: ''
    });
    
    const trackForm = ref({
      name: '',
      file_hash: '',
      color: '#6366f1'
    });
    
    const viewTitle = computed(() => {
      if (currentView.value === 'albums') return 'Админка';
      if (currentView.value === 'songs') return `${currentAlbum.value?.artist} - ${currentAlbum.value?.title}`;
      if (currentView.value === 'tracks') return currentSong.value?.title;
      return 'Админка';
    });
    
    function getRandomColor() {
      const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
        '#f97316', '#eab308', '#84cc16', '#10b981',
        '#06b6d4', '#3b82f6', '#6366f1', '#a855f7'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    const loadAlbums = async () => {
      albums.value = await api.getAlbums();
    };
    
    const loadSongs = async (albumId) => {
      songs.value = await api.getSongsByAlbum(albumId);
    };
    
    const loadTracks = async (songId) => {
      tracks.value = await api.getTracksBySong(songId);
    };
    
    const openAlbum = (album) => {
      currentAlbum.value = album;
      currentView.value = 'songs';
      loadSongs(album.id);
    };
    
    const openSong = (song) => {
      currentSong.value = song;
      currentView.value = 'tracks';
      loadTracks(song.id);
    };
    
    const goBack = async () => {
      if (currentView.value === 'tracks') {
        await loadSongs(currentAlbum.value.id);
        currentView.value = 'songs';
        currentSong.value = null;
      } else if (currentView.value === 'songs') {
        currentView.value = 'albums';
        currentAlbum.value = null;
      }
    };
    
    const handleDragStart = (event, itemId) => {
      draggedItemId.value = itemId;
      event.target.classList.add('dragging');
    };
    
    const handleDragOver = (event) => {
      event.preventDefault();
    };
    
    const handleDrop = async (event, targetId, listType) => {
      event.preventDefault();
      
      const draggedId = draggedItemId.value;
      if (draggedId === targetId) return;

      let list;
      let reorderFn;
      let idField;
      
      if (listType === 'albums') {
        list = albums.value;
        reorderFn = api.reorderAlbums;
        idField = 'sort_order';
      } else if (listType === 'songs') {
        list = songs.value;
        reorderFn = api.reorderSongs;
        idField = 'track_number';
      } else if (listType === 'tracks') {
        list = tracks.value;
        reorderFn = api.reorderTracks;
        idField = 'sort_order';
      }

      const draggedIndex = list.findIndex(item => item.id === draggedId);
      const targetIndex = list.findIndex(item => item.id === targetId);

      const [removed] = list.splice(draggedIndex, 1);
      list.splice(targetIndex, 0, removed);

      // Создаем массив для обновления порядка
      const orders = list.map((item, index) => ({
        id: item.id,
        [idField]: index
      }));

      await reorderFn(orders);
    };
    
    const handleDragEnd = (event) => {
      event.target.classList.remove('dragging');
      draggedItemId.value = null;
    };
    
    const openAlbumModal = (album = null) => {
      editingAlbum.value = album;
      if (album) {
        albumForm.value = {
          title: album.title,
          artist: album.artist,
          year: album.year,
          cover_hash: album.cover_hash || ''
        };
      } else {
        albumForm.value = {
          title: '',
          artist: '',
          year: new Date().getFullYear(),
          cover_hash: ''
        };
      }
      showAlbumModal.value = true;
    };
    
    const closeAlbumModal = () => {
      showAlbumModal.value = false;
      editingAlbum.value = null;
      uploadProgress.value = 0;
    };
    
    const openSongModal = (song = null) => {
      editingSong.value = song;
      if (song) {
        songForm.value = {
          title: song.title,
          lyrics: song.lyrics || '',
          tabs_url: song.tabs_url || '',
          stems_url: song.stems_url || ''
        };
      } else {
        songForm.value = {
          title: '',
          lyrics: '',
          tabs_url: '',
          stems_url: ''
        };
      }
      showSongModal.value = true;
    };
    
    const closeSongModal = () => {
      showSongModal.value = false;
      editingSong.value = null;
    };
    
    const openTrackModal = (track = null) => {
      editingTrack.value = track;
      if (track) {
        trackForm.value = {
          name: track.name,
          file_hash: track.file_hash || '',
          color: track.color || '#6366f1'
        };
      } else {
        trackForm.value = {
          name: '',
          file_hash: '',
          color: '#6366f1'
        };
      }
      showTrackModal.value = true;
    };
    
    const closeTrackModal = () => {
      showTrackModal.value = false;
      editingTrack.value = null;
      uploadProgress.value = 0;
      uploadingFiles.value = [];
      uploadedTracks.value = [];
    };
    
    const handleAlbumCoverUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      try {
        uploadProgress.value = 0;
        const result = await api.uploadFile(file, (p) => uploadProgress.value = p);
        albumForm.value.cover_hash = result.hash;
        uploadProgress.value = 100;
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Ошибка загрузки');
      }
    };
    
    const handleTrackFileUpload = async (event) => {
      const files = Array.from(event.target.files);
      if (!files.length) return;
      
      if (editingTrack.value) {
        const file = files[0];
        try {
          uploadProgress.value = 0;
          const result = await api.uploadFile(file, (p) => uploadProgress.value = p);
          trackForm.value.file_hash = result.hash;
          uploadProgress.value = 100;
        } catch (error) {
          console.error('Upload failed:', error);
          alert('Ошибка загрузки');
        }
      } else {
        uploadingFiles.value = files.map(f => ({ name: f.name, status: 'ожидание' }));
        uploadedTracks.value = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          uploadingFiles.value[i].status = 'загрузка...';
          
          try {
            const result = await api.uploadFile(file);
            uploadedTracks.value.push({
              name: file.name.replace(/\.[^/.]+$/, ''),
              file_hash: result.hash,
              color: getRandomColor()
            });
            uploadingFiles.value[i].status = '✓ готово';
          } catch (error) {
            console.error('Upload failed:', error);
            uploadingFiles.value[i].status = '✗ ошибка';
          }
        }
        
        uploadProgress.value = 100;
      }
    };
    
    const saveAlbum = async () => {
      isSaving.value = true;
      try {
        const data = {
          ...albumForm.value,
          sort_order: editingAlbum.value ? editingAlbum.value.sort_order : albums.value.length
        };
        if (editingAlbum.value) {
          await api.updateAlbum(editingAlbum.value.id, data);
        } else {
          await api.createAlbum(data);
        }
        await loadAlbums();
        closeAlbumModal();
      } catch (error) {
        console.error('Save failed:', error);
        alert('Ошибка сохранения');
      } finally {
        isSaving.value = false;
      }
    };
    
    const saveSong = async () => {
      isSaving.value = true;
      try {
        const data = {
          ...songForm.value,
          album_id: currentAlbum.value.id,
          track_number: editingSong.value ? editingSong.value.track_number : songs.value.length + 1
        };
        if (editingSong.value) {
          await api.updateSong(editingSong.value.id, data);
        } else {
          await api.createSong(data);
        }
        await loadSongs(currentAlbum.value.id);
        closeSongModal();
      } catch (error) {
        console.error('Save failed:', error);
        alert('Ошибка сохранения');
      } finally {
        isSaving.value = false;
      }
    };
    
    const saveTrack = async () => {
      if (editingTrack.value) {
        isSaving.value = true;
        try {
          const data = {
            ...trackForm.value,
            song_id: currentSong.value.id,
            sort_order: editingTrack.value.sort_order
          };
          await api.updateTrack(editingTrack.value.id, data);
          await loadTracks(currentSong.value.id);
          closeTrackModal();
        } catch (error) {
          console.error('Save failed:', error);
          alert('Ошибка сохранения');
        } finally {
          isSaving.value = false;
        }
      } else {
        if (uploadedTracks.value.length === 0) {
          alert('Пожалуйста, загрузите хотя бы один аудиофайл');
          return;
        }
        
        if (tracks.value.length + uploadedTracks.value.length > 7) {
          alert(`Нельзя добавить ${uploadedTracks.value.length} стем. Максимум 7 стем на песню.`);
          return;
        }
        
        isSaving.value = true;
        try {
          let sort_order = tracks.value.length;
          for (const trackData of uploadedTracks.value) {
            const data = {
              ...trackData,
              song_id: currentSong.value.id,
              sort_order: sort_order++
            };
            await api.createTrack(data);
          }
          await loadTracks(currentSong.value.id);
          closeTrackModal();
        } catch (error) {
          console.error('Save failed:', error);
          alert('Ошибка сохранения');
        } finally {
          isSaving.value = false;
        }
      }
    };
    
    const deleteAlbum = async (id) => {
      if (!confirm('Вы уверены, что хотите удалить этот альбом?')) return;
      
      try {
        await api.deleteAlbum(id);
        await loadAlbums();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Ошибка удаления');
      }
    };
    
    const deleteSong = async (id) => {
      if (!confirm('Вы уверены, что хотите удалить эту песню?')) return;
      
      try {
        await api.deleteSong(id);
        await loadSongs(currentAlbum.value.id);
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Ошибка удаления');
      }
    };
    
    const deleteTrack = async (id) => {
      if (!confirm('Вы уверены, что хотите удалить этот стем?')) return;
      
      try {
        await api.deleteTrack(id);
        await loadTracks(currentSong.value.id);
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Ошибка удаления');
      }
    };
    
    const logout = () => {
      store.logout();
      router.push('/login');
    };
    
    onMounted(async () => {
      if (!store.isAuthenticated.value) {
        router.push('/login');
        return;
      }
      await loadAlbums();
    });
    
    return {
      currentView,
      albums,
      songs,
      tracks,
      viewTitle,
      showAlbumModal,
      showSongModal,
      showTrackModal,
      albumForm,
      songForm,
      trackForm,
      isSaving,
      uploadProgress,
      uploadingFiles,
      editingAlbum,
      editingSong,
      editingTrack,
      openAlbum,
      openSong,
      goBack,
      handleDragStart,
      handleDragOver,
      handleDrop,
      handleDragEnd,
      openAlbumModal,
      closeAlbumModal,
      openSongModal,
      closeSongModal,
      openTrackModal,
      closeTrackModal,
      handleAlbumCoverUpload,
      handleTrackFileUpload,
      saveAlbum,
      saveSong,
      saveTrack,
      deleteAlbum,
      deleteSong,
      deleteTrack,
      logout
    };
  }
};
