import { ChannelJSON } from "./types"

/**
 * fetchChannel()
 * @params {string[]} channelIds? - array of channel ids to fetch
 * This async function makes a GET request to /api/channel/ and returns response
 */

const fetchChannel = async (channelIds?: string[]) => {
    console.log('fetchChannel')

    const url = '/api/channel/'

    if (!channelIds) {
        console.log(`fetchChannel(): Making GET request to /api/channel/`)
        try {
            const response = await fetch(url)
            if (response.ok) {
                const data = (await response.json()) as ChannelJSON;

                console.log(`fetchChannel(): response`, data)

                return data;
            } else {
                console.log(`fetchChannel(): error: \n statusCode: ${response.status} \n statusText: ${response.statusText}`)
            }
        }
        catch (error) {
            console.log(error)
            return;
        }
    }

    const channel_id = channelIds?.join(',');

    try {
        const response = await fetch(url + '?channel_id=' + channel_id)

        if (response.ok) {
            const data = (await response.json()) as ChannelJSON;

            console.log(`fetchChannel(): response`, data)

            return data;

        } else {
            console.log(`fetchChannel(): error: \n statusCode: ${response.status} \n statusText: ${response.statusText}`)
        }
    }
    catch (error) {
        console.log(error)
        return;
    }

}

export default fetchChannel;