# Инструкция по деплою Nuxt версии на Timeweb

## Шаг 1: Загрузка файлов на сервер

```bash
# Архивируем проект
cd C:\Users\LEHA\Desktop
7z a nuxt-project.zip multitrack-nuxt\

# Загружаем на сервер
scp nuxt-project.zip root@85.239.36.69:/var/www/

# Распаковываем на сервере
ssh root@85.239.36.69 "cd /var/www && rm -rf multitrack-nuxt && unzip -q nuxt-project.zip"
```

## Шаг 2: Установка зависимостей

```bash
ssh root@85.239.36.69

cd /var/www/multitrack-nuxt

# Устанавливаем Node.js 18 если нет
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Устанавливаем зависимости
npm install
```

## Шаг 3: Сборка проекта

```bash
cd /var/www/multitrack-nuxt
npm run build
```

## Шаг 4: Настройка PM2

```bash
# Устанавливаем PM2 глобально
npm install -g pm2

# Запускаем
cd /var/www/multitrack-nuxt
pm2 start npm --name "multitrack-nuxt" -- start
pm2 save
pm2 startup
```

## Шаг 5: Настройка Nginx

```bash
nano /etc/nginx/sites-available/multitrack
```

Добавь конфиг:

```nginx
server {
    listen 80;
    server_name 85.239.36.69;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -sf /etc/nginx/sites-available/multitrack /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Готово!

Открывай: http://85.239.36.69

## Полезные команды

```bash
# Перезапуск после изменений
cd /var/www/multitrack-nuxt
git pull  # или загрузи новые файлы
npm install
npm run build
pm2 restart multitrack-nuxt

# Логи
pm2 logs multitrack-nuxt

# Мониторинг
pm2 monit
```
