import * as http from 'http'
import * as Koa from 'koa'
import * as Router from '@koa/router'
import * as compress from 'koa-compress'
import * as bodyParser from 'koa-bodyparser'

const isTest = process.env.NODE_ENV === 'test'
const port = process.env.PORT || 4000
export const app: Koa = new Koa()
const router = new Router()

router.post('/data', async (ctx) => {
  try {
    ctx.body = ctx.request.body
  } catch (e) {
    ctx.body = e
  }
})

router.get('/:anything', async (ctx) => {
  ctx.type = 'application/json'
  ctx.body = JSON.stringify(ctx.params.anything)
})

router.get('/', async (ctx) => {
  ctx.type = 'application/json'
  ctx.body = { hello: 'world' }
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

app.use(compress())
app.use(bodyParser())
app.use(router.routes())
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
