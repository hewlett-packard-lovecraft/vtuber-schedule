import { test } from 'tap'
import streamStatus from '../../src/services/crawler/tasks/stream-status'
import crawlerHelper from './crawlerHelper'
import youtube from '../../src/plugins/youtube'

test('streamStatus task', async (t) => {
    const fastify = await crawlerHelper();
    fastify.register(youtube)
        .then(() => {
            streamStatus(fastify)
        })
})
