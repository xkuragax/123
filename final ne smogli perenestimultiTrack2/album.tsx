// @shared
import { jsx } from "@app/html-jsx"
import { HeadStyles, TailwindConfig, GlobalStyles } from './styles'
import AlbumPage from './pages/AlbumPage.vue'

export const albumPageRoute = app.get('/:id', async (ctx, req) => {
  return (
    <html>
      <head>
        <title>Album Details</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <HeadStyles />
        <TailwindConfig />
        <GlobalStyles />
        <script src="/s/metric/clarity.js"></script>
      </head>
      <body class="bg-darker min-h-screen">
        <AlbumPage albumId={req.params.id} />
      </body>
    </html>
  )
})
