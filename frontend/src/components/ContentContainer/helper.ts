import { StreamCard } from '../../types/types'
import groups from './groups';

/**
 * Sort input by most recent start_date, then filter out past & offline streams
 * @param {StreamCard[]} streams stream list to filter
 * @returns Stream[] filtered stream list
 */

export function filterScheduled(streams: StreamCard[]): StreamCard[] {
    const streamList = sortByDate(streams, 'asc').filter(
        (stream) => stream.start_date.diffNow('milliseconds').milliseconds >= 0 || stream.live
    );

    return streamList;
}

/**
 * Sort input by least recent start_date, Filter out future & live streams
 * @param {StreamCard[]} streams stream list to filter
 * @returns Stream[] filtered stream list
 */

export function filterArchived(streams: StreamCard[]): StreamCard[] {
    const streamList = sortByDate(streams, 'asc').filter(
        (stream) => stream.start_date.diffNow().as('milliseconds') <= 0 || !stream.live
    )

    return streamList;
}

/**
 * filter out streams with a different org_name
 * @returns Stream[] filtered stream list
 */

export function filterOrg(streams: StreamCard[], orgName: string): StreamCard[] {
    return streams.filter(
        (stream) => {
            return stream.org_name.toLowerCase() === orgName.toLowerCase()
        }
    )
}

/**
 * filter out streams with a different org_name
 * @returns Stream[] filtered stream list
 */

export function filterGroup(streams: StreamCard[], groupName: string): StreamCard[] {
    const group = groups[groupName].map(
        (groupName) => groupName.toLowerCase()
    );

    return streams.filter(
        (stream) => group.includes(stream.group_name.toLowerCase())
    )
}


/**
 * Sort a StreamCard[] by date
 * @param streams unsorted StreamCard[]
 * @param order 'asc' | 'desc'
 * @returns sorted StreamCard[]
 */

export function sortByDate(streams: StreamCard[], order: 'asc' | 'desc'): StreamCard[] {
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