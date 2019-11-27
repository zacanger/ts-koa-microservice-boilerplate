/* eslint-env jest */

import * as http from 'http'
import { app } from './'
// eslint-disable-next-line node/no-unpublished-import
import * as request from 'supertest'

describe('flags', () => {
  let server = null

  beforeEach(async () => {
    server = http.createServer(app.callback())
  })

  afterEach(() => {
    server.close()
  })

  test('/', async () => {
    const res = await request(server).get('/')
    expect(res.status).toEqual(200)
    expect(res.body.hello).toBe('world')
  })

  test('/foo', async () => {
    const res = await request(server).get('/foo')
    expect(res.status).toEqual(200)
    expect(res.body).toBe('foo')
  })

  test('/data', async () => {
    const res = await request(server)
      .post('/data')
      .send({ a: 1 })
    expect(res.status).toEqual(200)
    expect(typeof res.body).toBe('object')
    expect(res.body.a).toBe(1)
  })
})
