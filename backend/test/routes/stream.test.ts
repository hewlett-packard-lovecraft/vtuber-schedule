import { test } from 'tap'
import { build } from '../helper'

test('GET `/api/stream/` route', async (t) => {
    const app = await build(t)

    const res = await app.inject({
        url: '/api/stream/',
        method: 'GET'
    })

    t.equal(res.statusCode, 200)
})
