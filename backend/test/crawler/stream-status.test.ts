import { test } from 'tap'
import streamStatus from '../../src/services/crawler/tasks/stream-status'

test('streamStatus task', async (t) => {
    streamStatus.execute()
})
