import { StreamCard } from '../../types/types'

/**
 * Sort input by most recent start_date, then filter out past & offline streams
 * @param {StreamCard[]} streams stream list to filter
 * @returns Stream[] filtered stream list
 */

export function filterScheduled(streams: StreamCard[]) {
    streams = sortByDate(streams, 'asc')
    let streamList = []

    for (const stream of streams) {
        if (stream.start_date.diffNow('milliseconds').milliseconds >= 0 || stream.live) {
            streamList.push(stream)
        }
    }

    return streamList;
}

/**
 * Sort input by least recent start_date, Filter out future & live streams
 * @param {StreamCard[]} streams stream list to filter
 * @returns Stream[] filtered stream list
 */

export function filterArchived(streams: StreamCard[]) {
    streams = sortByDate(streams, 'asc')
    let streamList = []

    for (const stream of streams) {
        if (stream.start_date.diffNow().as('milliseconds') <= 0 || !stream.live) {
            streamList.push(stream)
        }
    }

    return streamList;
}

export function sortByDate(streams: StreamCard[], order: 'asc' | 'desc') {
    return streams.sort(
        (streamA: StreamCard, streamB: StreamCard) => {
            const startDateA = streamA.start_date;
            const startDateB = streamB.start_date;

            if (order === 'desc') {
                return startDateA.diff(startDateB).milliseconds;
            } else {
                return startDateB.diff(startDateA).milliseconds;
            }
        }
    )
}