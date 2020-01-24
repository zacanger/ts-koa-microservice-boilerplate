import * as http from 'http'
import { resolve } from 'path'
import * as Koa from 'koa'
import * as Router from '@koa/router'
import serve from 'koa-simple-static'
import * as mid from 'koa-mid'
import { timeBasedGuid } from './utils'

const isTest = process.env.NODE_ENV === 'test'
const port = process.env.PORT || 4000
export const app: Koa = new Koa()
const router = new Router()

router.get('/guid', async (ctx) => {
  ctx.type = 'application/json'
  ctx.body = JSON.stringify(timeBasedGuid())
})

router.post('/data', async (ctx) => {
  try {
    ctx.body = ctx.request.body
  } catch (e) {
    ctx.body = e
  }
})

router.get('/params-example/:anything', async (ctx) => {
  ctx.type = 'application/json'
  ctx.body = JSON.stringify(ctx.params.anything)
})

const errorHandler = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.app.emit('error', err, ctx)
    ctx.body = err
  }
}

app.use(mid)
app.use(router.routes())
app.use(
  serve({
    dir: resolve(__dirname, '..', 'public'),
  })
)
app.use(errorHandler)

const handler = app.callback()

const server = http.createServer((req, res) => {
  handler(req, res)
})

const main = () => {
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`example listening on ${port}`)
  })

  // Docker gives containers 10 seconds to handle SIGTERM
  // before sending SIGKILL. Close all current connections
  // graceully and exit with 0.
  process.on('SIGTERM', () => {
    server.close(() => {
      process.exit(0)
    })
  })
}

if (!isTest) {
  main()
}
