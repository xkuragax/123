export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  devtools: { enabled: false },
  ssr: true,
  nitro: {
    preset: 'node-server'
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: '🎵 MultiTrack Player',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css' }
      ]
    }
  },
  compatibilityDate: '2025-01-21'
})