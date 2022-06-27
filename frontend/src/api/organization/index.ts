import { organizationResponse } from "./types"

/**
 * fetchOrganization()
 * This async function makes a GET request to /api/organization/
 */


const fetchOrganization = async () => {
    console.log(`[${new Date()}]`, 'fetchOrganization(): START')

    const url = '/api/organization/'

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