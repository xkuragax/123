# 🎵 MultiTrack Player - Готовый к деплою пакет

## ⚡ Быстрый старт

```bash
# 1. Подключись к серверу по SSH
ssh root@твой-ip

# 2. Установи Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. Создай папку проекта
mkdir -p /var/www/multitrack
cd /var/www/multitrack

# 4. Загрузи файлы проекта (через SFTP/SCP)
# Используй FileZilla или scp:
# scp -r /локальный/путь/* root@твой-ip:/var/www/multitrack/

# 5. Установи зависимости
npm install

# 6. Создай необходимые папки
mkdir -p data logs public/uploads

# 7. Установи PM2
npm install -g pm2

# 8. Запусти приложение
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

# Готово! Приложение работает на порту 3000
```

## 🔧 Настройка Nginx

```bash
apt-get install nginx

# Создай конфиг
cat > /etc/nginx/sites-available/multitrack << 'EOF'
server {
    listen 80;
    server_name _;  # Или твой домен
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
    
    client_max_body_size 500M;
}
EOF

ln -sf /etc/nginx/sites-available/multitrack /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## 📁 Структура проекта

```
timeweb-deploy/
├── public/              # Статические файлы
│   ├── index.html      # Главная страница
│   └── js/
│       └── app.js      # Vue.js приложение
├── server/             # Бэкенд
│   ├── app.js          # Express приложение
│   ├── database.js     # SQLite база данных
│   └── routes/         # API роуты
├── data/               # База данных (создаётся автоматически)
├── logs/               # Логи PM2
├── package.json        # Зависимости
├── ecosystem.config.js # Конфиг PM2
└── setup.sh            # Авто-скрипт установки
```

## 🎛️ Управление

```bash
# Статус
pm2 status

# Логи
pm2 logs

# Перезапуск
pm2 restart multitrack-player

# Остановка
pm2 stop multitrack-player
```

## 🔌 API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/albums` | Список альбомов |
| GET | `/api/albums/:id/songs` | Песни альбома |
| GET | `/api/songs/:id/tracks` | Треки песни |
| POST | `/api/upload` | Загрузка файла |

## 🎨 Функции

- ✅ Каталог альбомов с обложками
- ✅ Плеер с мультитрековым воспроизведением
- ✅ Регулировка громкости каждого стема
- ✅ Mute/Solo режимы
- ✅ Seek по таймлайну
- ✅ Тёмная тема
- ✅ Адаптивный дизайн
