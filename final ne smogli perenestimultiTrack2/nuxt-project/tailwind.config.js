/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        'primary-dark': '#2563eb',
        secondary: '#8b5cf6',
        dark: '#171717',
        'dark-light': '#262626',
        darker: '#0a0a0a',
        light: '#f3f4f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        accent: '#3b82f6',
        muted: '#737373',
        'text-primary': '#ffffff',
        'text-secondary': '#a3a3a3',
      }
    }
  },
  plugins: []
}
