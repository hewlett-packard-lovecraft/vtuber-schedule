import { test } from 'tap'
import streamStatus from '../../src/services/crawler/tasks/stream-status'
import crawlerHelper from './crawlerHelper'

test('streamStatus task', async (t) => {
    const fastify = await crawlerHelper();
    streamStatus(fastify);
})
