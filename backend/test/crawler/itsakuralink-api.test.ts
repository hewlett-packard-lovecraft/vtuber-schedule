import { test } from 'tap'
import itsakuralinkApi from '../../src/services/crawler/tasks/itsakuralink-api'

test('itsakuraLinkApi task', async (t) => {
    itsakuralinkApi.execute()
})
