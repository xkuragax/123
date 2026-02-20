module.exports = {
  apps: [{
    name: 'multitrack-player',
    script: './server/app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Логи
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Перезапуск при падении
    min_uptime: '10s',
    max_restarts: 10,
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 10000,
    // Автоматическая ротация логов (требует pm2-logrotate)
    // pm2 install pm2-logrotate
    log_rotate_interval: '1d',
    log_max_size: '10M',
    log_retention: '30d'
  }]
};
