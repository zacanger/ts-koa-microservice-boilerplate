import * as crypto from 'node:crypto'
import * as Koa from 'koa'
import * as winston from 'winston'
import koaLogger from 'koa-logger'
// @ts-expect-error no types
import { logger as koaWinston } from 'koa2-winston'

// provide from env or pkg or whatever
const appName = 'app'
const version = '0.0.1'
const isProd = process.env.NODE_ENV === 'production'

// usually 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
// though it could depend on implementation
const logLevel = process.env.LOG_LEVEL ?? 'info'

const setReqId = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  const semiRandomString = crypto.randomBytes(8).toString('hex')
  const reqId = `${semiRandomString}-${appName}-${version}`
  // @ts-expect-error
  ctx.request.reqId = reqId
  ctx.response.set('x-trace-id', reqId)
  const logFields = { reqId }
  ctx.log = ctx.log.child(logFields)
  return await next()
}

export const log = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format((info: any) => {
      // provide from env, pkg, or whatever
      info.version = version
      info.app = appName
      return info
    })(),

    winston.format((info: any) => {
      if (typeof info?.req?.header?.authorization === 'string') {
        info.req.header.authorization = 'REDACTED'
      }
      return info
    })(),

    isProd ? winston.format.json() : winston.format.cli()
  ),
  transports: [new winston.transports.Console()]
})

const setLogger = (app: Koa): void => {
  app.use(
    async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
      ctx.log = log
      await next()
    }
  )
}

export default (app: Koa): void => {
  app.on('error', (err: Error): void => {
    log.error(err)
  })

  if (isProd) {
    app.use(setReqId)
    if (['info', 'debug', 'trace'].includes(logLevel)) {
      app.use(
        koaWinston({
          logger: log
        })
      )
    }
  } else {
    app.use(koaLogger())
  }

  setLogger(app)
}
