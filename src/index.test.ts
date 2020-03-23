/* eslint-env jest */

import * as http from 'http'
import { app } from '.'
// eslint-disable-next-line node/no-unpublished-import
import * as request from 'supertest'

describe('example', () => {
  let server = null

  beforeEach(async () => {
    server = http.createServer(app.callback())
  })

  afterEach(() => {
    server.close()
  })

  test('/params-example/foo', async () => {
    const res = await request(server).get('/params-example/foo')
    expect(res.status).toEqual(200)
    expect(res.body).toBe('foo')
  })

  test('/guid', async () => {
    const res = await request(server).get('/guid')
    expect(res.status).toEqual(200)
    expect(typeof res.body).toBe('string')
  })

  test('/data', async () => {
    const res = await request(server).post('/data').send({ a: 1 })
    expect(res.status).toEqual(200)
    expect(typeof res.body).toBe('object')
    expect(res.body.a).toBe(1)
  })
})
