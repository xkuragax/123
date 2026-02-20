# Multitrack Player - Самостоятельная версия

Полностью перенесённый мультитрековый плеер с Chatium на Node.js + PostgreSQL + Yandex Object Storage.

## Что внутри

- **Backend**: Node.js + Express
- **Database**: PostgreSQL (можно Yandex Managed PostgreSQL или свою)
- **Storage**: Yandex Object Storage (S3-совместимое хранилище)
- **Frontend**: Vue 3 (полностью сохранён оригинальный дизайн)

## Пошаговая инструкция по установке

### Шаг 1: Установите Node.js

1. Откройте сайт https://nodejs.org/
2. Скачайте версию **LTS** (долгосрочная поддержка)
3. Установите, нажимая "Далее" (все галочки по умолчанию)

### Шаг 2: Создайте базу данных PostgreSQL

**Вариант А - Yandex Managed PostgreSQL (облачная, платная, но стабильная):**

1. Зайдите в консоль Яндекс Облака: https://console.cloud.yandex.ru/
2. Создайте каталог (если нет): нажмите справа сверху на имя аккаунта → "Создать каталог"
3. Перейдите в раздел **Managed Service for PostgreSQL**
4. Нажмите **"Создать кластер"**
5. Заполните:
   - **Имя кластера**: `multitrack-db`
   - **Версия**: 15
   - **Класс хоста**: s2.micro (самый дешёвый)
   - **Размер хранилища**: 10 ГБ
   - **Имя БД**: `multitrack_db`
   - **Имя пользователя**: `dbuser`
   - **Пароль**: придумайте сложный пароль, сохраните!
6. Нажмите **"Создать кластер"** и ждите 5-10 минут
7. Когда кластер создастся, зайдите в него
8. Найдите вкладку **"Хосты"**, там будет адрес вида `rc1a-xxx.mdb.yandexcloud.net`
9. Сохраните этот адрес, он понадобится

**Вариант Б - Локальная PostgreSQL (бесплатно, но только для теста):**

1. Скачайте PostgreSQL: https://www.postgresql.org/download/
2. Установите
3. При установке запомните пароль для пользователя `postgres`
4. Откройте pgAdmin (устанавливается вместе с PostgreSQL)
5. Создайте базу данных `multitrack_db`

### Шаг 3: Создайте Object Storage bucket

1. В консоли Яндекс Облака перейдите в **Object Storage**
2. Нажмите **"Создать бакет"**
3. **Имя бакета**: уникальное название, например `multitrack-music-yourname`
4. **Класс хранилища**: Standard
5. **Доступ**: Ограниченный
6. Нажмите **"Создать бакет"**
7. Теперь нужно создать ключи доступа:
   - Перейдите в сервисный аккаунт (или создайте: IAM → Сервисные аккаунты → Создать)
   - Нажмите на сервисный аккаунт → **"Создать ключ доступа"**
   - Выберите **"Создать статический ключ доступа"**
   - Описание: `multitrack`
   - Сохраните **Key ID** и **Secret Key** (показываются один раз!)
8. Дайте права сервисному аккаунту на бакет:
   - Зайдите в бакет → Права доступа
   - Добавьте сервисный аккаунт с ролью `storage.editor`

### Шаг 4: Загрузите проект на сервер

**Если у вас VPS/сервер:**

1. Подключитесь к серверу по SSH
2. Установите Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Создайте папку для проекта:
```bash
mkdir -p /var/www/multitrack
cd /var/www/multitrack
```

4. Загрузите файлы проекта (через SFTP или git)

5. Установите зависимости:
```bash
npm install
```

### Шаг 5: Настройте переменные окружения

1. Скопируйте файл `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Откройте файл `.env` и заполните:

```env
# Database (вставьте свои данные)
DB_HOST=rc1a-xxx.mdb.yandexcloud.net  # или localhost для локальной
DB_PORT=5432
DB_NAME=multitrack_db
DB_USER=dbuser  # или postgres для локальной
DB_PASSWORD=your_password_here

# Yandex Object Storage (вставьте свои ключи)
S3_ENDPOINT=https://storage.yandexcloud.net
S3_REGION=ru-central1
S3_BUCKET=multitrack-music-yourname
S3_ACCESS_KEY_ID=your_key_id_here
S3_SECRET_ACCESS_KEY=your_secret_key_here

# Server
PORT=3000
NODE_ENV=production

# Admin password (придумайте пароль для входа в админку)
ADMIN_PASSWORD=your_secure_password
```

### Шаг 6: Инициализируйте базу данных

Выполните команду:
```bash
npm run db:init
```

Или вручную через SQL:
```bash
psql -h your_db_host -U your_db_user -d multitrack_db -f scripts/init-db.sql
```

### Шаг 7: Запустите сервер

Для теста:
```bash
npm start
```

Для production (через PM2):
```bash
npm install -g pm2
pm2 start server/index.js --name multitrack
pm2 save
pm2 startup
```

### Шаг 8: Настройте Nginx (если используете домен)

1. Установите Nginx:
```bash
sudo apt install nginx
```

2. Создайте конфиг:
```bash
sudo nano /etc/nginx/sites-available/multitrack
```

3. Вставьте (замените `your-domain.com` на свой домен):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 500M;
}
```

4. Активируйте:
```bash
sudo ln -s /etc/nginx/sites-available/multitrack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. Получите SSL (HTTPS):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Как использовать

### Для посетителей
- Открывайте сайт - видите каталог альбомов
- Кликайте на альбом - видите список песен
- Кликайте на песню - открывается плеер с мультитреками
- Кнопка M - заглушить трек
- Кнопка S - соло (только этот трек)
- Ползунок - громкость
- Play/Pause - управление

### Для администратора
1. Перейдите на `/login`
2. Введите пароль из `ADMIN_PASSWORD`
3. В админке можно:
   - Добавлять/редактировать/удалять альбомы
   - Добавлять песни с текстами
   - Загружать стемы (до 7 на песню)
   - Менять порядок drag-and-drop

## Важные моменты

1. **Файлы хранятся в Yandex Object Storage** - не на сервере
2. **Все аудиофайлы должны быть в формате MP3**
3. **Максимум 7 стем на одну песню**
4. **Бесплатный пакет Яндекс Облака**: 2 ГБ хранилища, 5 ГБ трафика в месяц

## Что делать при проблемах

**Не подключается к базе данных:**
- Проверьте настройки в `.env`
- Убедитесь что IP сервера добавлен в белый список базы данных

**Не загружаются файлы:**
- Проверьте ключи S3 в `.env`
- Убедитесь что бакет существует
- Проверьте права доступа сервисного аккаунта

**Сайт не открывается:**
- Проверьте что сервер запущен: `pm2 status`
- Проверьте логи: `pm2 logs multitrack`
- Проверьте firewall (порт 3000 должен быть открыт или закрыт если используете Nginx)

## Папки проекта

```
multitrack-player/
├── server/              # Backend
│   ├── index.js         # Главный файл сервера
│   ├── db.js            # Подключение к базе
│   ├── storage.js       # Работа с S3
│   └── routes/          # API маршруты
├── public/              # Frontend
│   ├── index.html       # Главная страница
│   ├── css/             # Стили
│   └── js/              # Vue компоненты
├── scripts/             # Скрипты
│   ├── init-db.js       # Инициализация базы
│   └── init-db.sql      # SQL скрипт
├── .env                 # Настройки (не загружайте в git!)
├── .env.example         # Пример настроек
└── package.json         # Зависимости
```

## Поддержка

Если что-то не работает:
1. Проверьте логи сервера
2. Проверьте логи базы данных
3. Убедитесь что все переменные окружения заполнены
4. Проверьте доступность портов

Успехов!
