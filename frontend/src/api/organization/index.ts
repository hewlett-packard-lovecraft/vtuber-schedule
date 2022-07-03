import { organizationResponse } from "./types"

/**
 * fetchOrganization()
 * @params {Date} before - fetch streams scheduled to start before this date
 * @params {Date} after - fetch streams scheduled to start after this date
 * This async function makes a GET request to /api/organization/?before={}?after={}
 */


const fetchOrganization = async (before: Date, after: Date) => {
    console.log(`[${new Date()}]`, 'fetchOrganization(): START')

    let url = `/api/organization/?before=${before.toISOString()}&?after=${after.toISOString()}`

    try {
        const response = await fetch(url)

        if (response.ok) {
            const data = (await response.json()) as organizationResponse

            console.log(`[${new Date()}]`, `fetchOrganization(): Fetched data \n ${data}`)

            return data;
        } else {
            console.error(`fetchOrganization(): error \n statusCode: ${response.status} \n statusText: ${response.statusText}`)

            return;
        }

    } catch (error) {
        console.error(`fetchOrganization(): error `, error)
        return;
    }
}

export default fetchOrganization