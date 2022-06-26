import { test } from 'tap'
import { build } from '../helper'

test('GET `/api/organization/` route', async (t) => {
    const app = await build(t)

    const res = await app.inject({
        url: '/api/organization/',
        method: 'GET'
    })

    t.equal(res.statusCode, 200)
})
