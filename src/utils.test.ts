/* eslint-env jest */

import * as utils from './utils'

describe('utils', () => {
  test('timeBasedGuid', () => {
    // eslint-disable-next-line unicorn/no-unsafe-regex
    const re = /({){0,1}[\dA-Fa-f]{8}(?:-[\dA-Fa-f]{4}){3}-[\dA-Fa-f]{12}(}){0,1}/
    expect(re.test(utils.timeBasedGuid())).toBe(true)
  })
})
