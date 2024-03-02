import { test } from 'node:test'
import * as assert from 'node:assert'
import * as utils from './utils'

void test('utils', (t) => {
  void t.test('timeBasedGuid', () => {
    const re = /({){0,1}[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}(}){0,1}/
    assert.ok(re.test(utils.timeBasedGuid()))
  })
})
