import { test } from 'tap'
import { build } from '../helper'

test('default root route', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'GET',
    url: '/',
  })

  t.equal(res.statusCode, 200)
})
