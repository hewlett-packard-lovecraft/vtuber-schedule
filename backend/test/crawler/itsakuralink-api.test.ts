import { test } from 'tap'
import itsakuralinkApi from '../../src/services/crawler/tasks/itsakuralink-api'
import crawlerHelper from './crawlerHelper'

test('itsakuraLinkApi task', async (t) => {
    const fastify = await crawlerHelper()
    itsakuralinkApi(fastify)

    fastify.close();
})
