import { test } from 'tap'
import Fastify from 'fastify'
import crawlerPlugin from '../../src/services/crawler'

test('fastify-scheduler plugin', async (t) => {
    const fastify = Fastify()
    void fastify.register(crawlerPlugin)
    await fastify.ready()

    t.ok(!!fastify.lastUpdated)
    t.ok(!!fastify.scheduler)
})
