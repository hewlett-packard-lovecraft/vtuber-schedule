import { test } from 'tap'
import streamListFeed from '../../src/services/crawler/tasks/stream-list-feed'

test('streamListFeed task', async (t) => {
    streamListFeed.execute()
})

