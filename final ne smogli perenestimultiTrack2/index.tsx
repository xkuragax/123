import { jsx } from "@app/html-jsx"
import { HeadStyles, TailwindConfig, GlobalStyles } from './styles'
import CatalogPage from './pages/CatalogPage.vue'

export const indexPageRoute = app.get('/', async (ctx, req) => {
  return (
    <html>
      <head>
        <title>Music Catalog</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <HeadStyles />
        <TailwindConfig />
        <GlobalStyles />
        <script src="/s/metric/clarity.js"></script>
      </head>
      <body class="bg-darker min-h-screen">
        <CatalogPage />
      </body>
    </html>
  )
})
