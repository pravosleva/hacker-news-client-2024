import { expect, test } from 'vitest'
import { getZero } from './getZero'

test('getZero: 1 to equal 01', () => {
  expect(getZero(1)).toBe('01')
})
