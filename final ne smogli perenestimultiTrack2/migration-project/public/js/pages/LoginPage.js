const { ref } = Vue;
const { useRouter } = VueRouter;

export default {
  template: `
    <div class="min-h-screen bg-darker flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-dark rounded-xl p-8 border border-muted">
        <div class="text-center mb-8">
          <i class="fas fa-lock text-4xl text-accent mb-4"></i>
          <h1 class="text-2xl font-bold text-text-primary">Вход в админку</h1>
          <p class="text-text-secondary mt-2">Введите пароль администратора</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <input 
              v-model="password"
              type="password"
              placeholder="Пароль"
              class="w-full px-4 py-3 bg-darker border border-muted rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
              required
            />
          </div>
          
          <div v-if="error" class="text-red-500 text-sm text-center">
            {{ error }}
          </div>
          
          <button 
            type="submit"
            class="w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors"
          >
            Войти
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <router-link to="/" class="text-text-secondary hover:text-accent text-sm">
            ← Вернуться на главную
          </router-link>
        </div>
      </div>
    </div>
  `,
  
  setup() {
    const router = useRouter();
    const password = ref('');
    const error = ref('');
    
    const handleLogin = async () => {
      try {
        // Проверяем пароль через API
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: password.value })
        });
        
        if (res.ok) {
          store.login(password.value);
          router.push('/admin');
        } else {
          error.value = 'Неверный пароль';
        }
      } catch (e) {
        error.value = 'Ошибка соединения';
      }
    };
    
    return { password, error, handleLogin };
  }
};
