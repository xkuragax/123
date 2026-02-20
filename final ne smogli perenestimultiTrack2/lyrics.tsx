// @shared
import { jsx } from "@app/html-jsx"
import { HeadStyles, TailwindConfig, GlobalStyles } from './styles'
import LyricsPage from './pages/LyricsPage.vue'

export const lyricsPageRoute = app.get('/:songId/lyrics', async (ctx, req) => {
  const songId = req.params.songId

  return (
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Текст песни - Multitrack Player</title>
        <HeadStyles />
        <TailwindConfig />
        <GlobalStyles />
      </head>
      <body class="bg-darker text-text-primary font-sans min-h-screen">
        <LyricsPage songId={songId} />
      </body>
    </html>
  )
})
