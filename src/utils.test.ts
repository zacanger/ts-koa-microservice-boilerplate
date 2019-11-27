/* eslint-env jest */

import * as utils from './utils'

describe('utils', () => {
  test('timeBasedGuid', () => {
    const re = /(\{){0,1}[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(\}){0,1}/
    expect(re.test(utils.timeBasedGuid())).toBe(true)
  })
})
