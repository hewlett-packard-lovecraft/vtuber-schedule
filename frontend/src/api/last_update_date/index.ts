import { lastUpdateDateResponse } from "./types"

/**
 * fetchLastUpdateDate()
 * This async function makes a GET request to /api/last_update_date/
 */

const fetchLastUpdateDate = async () => {
    const url = '/api/last_update_date/'

    console.log('lastUpdateDate(): Making GET request to /api/last_update_date/')

    try {
        const res = await fetch(url)

        if (res.ok) {
            const data = (await res.json()) as lastUpdateDateResponse

            console.log(`lastUpdateDate(): response`, data)

            return data
        } else {
            console.error(`lastUpdateDate(): error \n statusCode: ${res.status} \n statusText: ${res.statusText}`)
            return;
        }
    }
    catch (error) {
        console.error(`lastUpdateDate(): error: \n `, error)
    }

    return;
}

export default fetchLastUpdateDate;