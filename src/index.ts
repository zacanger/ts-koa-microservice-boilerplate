import * as http from 'http'
import { resolve } from 'path'
import Koa from 'koa'
import Router from '@koa/router'
import body from 'koa-bodyparser'
import lower from 'koa-lowercase'
import cookie = require('koa-cookie') // ugh
import helmet from 'koa-helmet'
import serve from 'koa-simple-static'
import { timeBasedGuid } from './utils'
import logger, { log } from './logger'
import * as pg from 'pg'

const isTest = process.env.NODE_ENV === 'test'
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
const port = process.env.PORT ?? 4000
export const app: Koa = new Koa()
const router = new Router()

const pgUser = process.env.POSTGRES_USER ?? 'username'
const pgPass = process.env.POSTGRES_PASSWORD ?? 'password'
const pgHost = process.env.POSTGRES_HOST ?? 'db'
const pgDb = process.env.POSTGRES_DB ?? 'database'
const pgPort = parseInt(process.env.POSTGRES_PORT ?? '5432', 10)
const fakePg = {
  query: async (..._args: any[]): Promise<null> => null,
  connect: async (): Promise<null> => null
}

const db = isTest
  ? fakePg
  : new pg.Client({
    database: pgDb,
    host: pgHost,
    password: pgPass,
    port: pgPort,
    user: pgUser
  })

router.get('/guid', async (ctx: Koa.Context) => {
  ctx.type = 'application/json'
  ctx.body = JSON.stringify(timeBasedGuid())
})

router.post('/data', async (ctx: Koa.Context) => {
  try {
    await db.query(
      'insert into boilerplate (stuff) values($1)',
      [JSON.stringify(ctx.request.body)]
    )

    ctx.type = 'application/json'
    ctx.body = { ok: 'yup' }
  } catch (e) {
    ctx.body = e
  }
})

router.get('/params-example/:anything', async (ctx: Koa.Context) => {
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

const setupDb = async (): Promise<void> => {
  await db.connect()
  await db.query(`
   create table if not exists boilerplate(
     id serial,
     stuff jsonb
   )
  `)
}

const main = (): void => {
  void setupDb()
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
