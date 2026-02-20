import { jsx } from "@app/html-jsx"
import { requireAccountRole } from '@app/auth'
import { HeadStyles, TailwindConfig, GlobalStyles } from './styles'
import AdminPanel from './pages/AdminPanel.vue'

export const adminRoute = app.get('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')
  
  return (
    <html>
      <head>
        <title>Admin Panel - MultiTrack</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <HeadStyles />
        <TailwindConfig />
        <GlobalStyles />
      </head>
      <body class="bg-darker min-h-screen">
        <AdminPanel />
      </body>
    </html>
  )
})
