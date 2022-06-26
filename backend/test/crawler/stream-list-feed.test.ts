import { test } from 'tap'
import streamListFeed from '../../src/services/crawler/tasks/stream-list-feed'
import crawlerHelper from './crawlerHelper'

test('streamListFeed task', async (t) => {
    const fastify = await crawlerHelper();
    streamListFeed(fastify);
})

