import { Organization } from "../types/types"
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


const refresh = async (pageActive: boolean, data: Organization[], lastUpdatedAt: Date) => {
    console.log(`[${new Date()}]`,'refresh(): START')

    if (!pageActive) { // skip update if page is inactive
        console.log(`[${new Date()}]`,'refresh(): Page is inactive, skipping update')
        return [data, lastUpdatedAt]
    }

    const apiLastUpdateDate = (await fetchLastUpdateDate())?.lastUpdatedAt

    if (!apiLastUpdateDate) {
        console.error('refresh(): failed to fetch last update date')
        return [data, lastUpdatedAt]
    }

    // fetch new data from the API only if data has been updated, or if data is empty
    if ((apiLastUpdateDate > lastUpdatedAt) || (!data || data.length === 0)) {
        const dataLatest = (await fetchOrganization())?.organization;

        if (!dataLatest) {
            console.error('refresh(): failed to fetch data')
            return [data, apiLastUpdateDate]
        } else {
            console.log(`[${new Date()}]`,'refreshed() successfully updated stream data')
            return [dataLatest, apiLastUpdateDate]
        }
    }

    console.log(`[${new Date()}]`,'refresh(): no updates to be made')
    return [data, lastUpdatedAt]
}

export default refresh;