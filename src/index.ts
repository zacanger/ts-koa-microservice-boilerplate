import * as http from 'http'
import { resolve } from 'path'
import * as Koa from 'koa'
import * as Router from '@koa/router'
import * as body from 'koa-bodyparser'
import * as lower from 'koa-lowercase'
import cookie = require('koa-cookie') // ugh
import * as helmet from 'koa-helmet'
import serve from 'koa-simple-static'
import { timeBasedGuid } from './utils'
import logger, { log } from './logger'

const isTest = process.env.NODE_ENV === 'test'
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
const port = process.env.PORT ?? 4000
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

const errorHandler = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  try {
    await next()
    // TODO: is there an existing type for Koa errors?
    // i seem to remember them just being inherited from Node http errors,
    // but i could be wrong
    // anyway, get rid of the 'any' here
  } catch (err: any) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    ctx.status = err.status || 500
    ctx.app.emit('error', err, ctx)
    ctx.body = err
  }
}

app.use(body())
// @ts-expect-error the types are janky
app.use(cookie.default())
app.use(helmet())
app.use(lower)
app.use(router.routes())
app.use(serve({ dir: resolve(__dirname, '..', 'public') }))
app.use(errorHandler)
logger(app)

const handler = app.callback()

const server = http.createServer((req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  handler(req, res)
})

const main = (): void => {
  server.listen(port, () => {
    log.info(`example listening on ${port}`)
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
