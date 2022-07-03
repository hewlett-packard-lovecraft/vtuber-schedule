import { StreamCard } from "../types/types"
import fetchLastUpdateDate from "./last_update_date";
import fetchOrganization from "./organization"

/**
 * refresh()
 * @param {boolean} pageActive - page activity
 * @param {Organization[]} data - local state
 * @param {Date} lastUpdatedAt - last updated at
 * This function takes in the local state and returns an updated version from `/api/`
 * refresh() will return the local state as-is if:
 * - the page is inactive
 * - lastUpdatedAt >= api last_update_date
 */


const refresh = async (pageActive: boolean, streamCards: StreamCard[], lastUpdatedAt: Date) => {
    console.log(`[${new Date()}]`, 'refresh(): START')

    if (!pageActive) { // skip update if page is inactive
        console.log(`[${new Date()}]`, 'refresh(): Page is inactive, skipping update')
        return;
    }

    const lastUpdateDateLatest = (await fetchLastUpdateDate())?.lastUpdatedAt

    if (!lastUpdateDateLatest) {
        console.error('refresh(): failed to fetch last update date')
        return;
    }

    // fetch new data from the API only if data has been updated since the last refresh or if internal state is empty
    if ((lastUpdateDateLatest > lastUpdatedAt) || (!streamCards || streamCards.length === 0)) {
        const dataLatest = (await fetchOrganization(
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        ))?.organization; // fetch streams 2 days old or 7 days in the future

        if (!dataLatest) {
            console.error('refresh(): failed to fetch data')
            return;
        } else {
            console.log(`[${new Date()}]`, 'refreshed() successfully updated stream data')
            return [dataLatest, lastUpdateDateLatest]
        }
    }

    console.log(`[${new Date()}]`, 'refresh(): no updates to be made')
    return [streamCards, lastUpdatedAt]
}


export default refresh;