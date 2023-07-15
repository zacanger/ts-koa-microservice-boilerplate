import * as crypto from 'crypto'
import * as Koa from 'koa'
import * as ip from 'ip'
import * as winston from 'winston'
import * as koaLogger from 'koa-logger'
import { logger as koaWinston } from 'koa2-winston'
import * as pkg from '../package.json'

const isProd = process.env.NODE_ENV === 'production'

// Provide these from config or env vars or package.json or whatever
const version = pkg.version
const appName = pkg.name
// usually 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
// though it could depend on implementation
const logLevel = process.env.LOG_LEVEL ?? 'info'

const setReqId = async (ctx: Koa.Context, next: Koa.Next): Promise<void> => {
  const localIp = ip.toBuffer(ip.address()).toString('hex')
  const semiRandomString = crypto.randomBytes(8).toString('hex')
  const reqId = `${semiRandomString}-${localIp}-${appName}`
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
    winston.format((info) => {
      info.version = version
      info.app = appName
      return info
    })(),

    winston.format((info) => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (info?.req?.header?.authorization) {
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
