import { test } from 'tap'
import { build } from '../helper'

test('GET `/api/last_update_date/` route', async (t) => {
    const app = await build(t)

    const res = await app.inject({
        url: '/api/last_update_date/',
        method: 'GET'
    })

    t.equal(res.statusCode, 200)
})

