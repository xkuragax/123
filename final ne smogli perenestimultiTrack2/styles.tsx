// @shared
import { jsx } from "@app/html-jsx"

export function HeadStyles() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="/s/static/lib/fontawesome/6.7.2/css/all.min.css" rel="stylesheet" />
      <script src="/s/static/lib/tailwind.3.4.16.min.js"></script>
    </>
  )
}

export function TailwindConfig() {
  return (
    <script>{`
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              dark: '#0f0f0f',
              darker: '#080808',
              accent: '#6366f1',
              'accent-hover': '#818cf8',
              muted: '#374151',
              'text-primary': '#f9fafb',
              'text-secondary': '#9ca3af'
            },
            fontFamily: {
              sans: ['Inter', 'sans-serif']
            }
          }
        }
      }
    `}</script>
  )
}

export function GlobalStyles() {
  return (
    <style>{`
      /* Hide scrollbar for Firefox */
      * {
        scrollbar-width: none;
      }
      
      /* Hide scrollbar for Chrome, Safari and Edge */
      *::-webkit-scrollbar {
        display: none;
      }
    `}</style>
  )
}
