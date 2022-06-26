import { test } from 'tap'
import { build } from '../helper'

test('GET `/api/organization/ route`', async (t) => {
    const app = await build(t)

    const res = await app.inject({
        url: '/api/group/',
        method: 'GET'
    })

    console.log('body: ', res.body)
    //t.equal(res.statusCode, 200)
})