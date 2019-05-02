import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as compress from 'koa-compress'

const port = process.env.PORT || 4000
const app: Koa = new Koa()
const router = new Router()

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
app.use(router.routes())
app.use(errorHandler)

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`example listening on ${port}`)
})
