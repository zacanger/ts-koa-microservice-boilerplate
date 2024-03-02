/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { describe, it, beforeEach, afterEach } from 'node:test'
import * as assert from 'node:assert'
import * as http from 'node:http'
import { app } from './index'
import request from 'supertest'

void describe('example', async () => {
  let server: http.Server | null = null

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server = http.createServer(app.callback())
  })

  afterEach(() => {
    server!.close()
  })

  void it('/params-example/foo', async () => {
    const res = await request(server!).get('/params-example/foo')
    assert.equal(res.status, 200)
    assert.equal(res.body, 'foo')
  })

  void it('/guid', async () => {
    const res = await request(server!).get('/guid')
    assert.equal(res.status, 200)
    assert.equal(typeof res.body, 'string')
  })

  void it.skip('/data', async () => {
    const res = await request(server!).post('/data').send({ a: 1 })
    assert.equal(res.status, 200)
    assert.equal(res.body.ok, 'yup')
  })
})
