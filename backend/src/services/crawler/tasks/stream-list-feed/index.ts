import { FastifyInstance } from "fastify"
import axios from "axios";
import xml2json from "xml2json"
import { XMLFeedAPIResponse, Entry, Video } from "./types";

/**
 * stream-list-feed
 * - This function updates stream list for hololive channels via youtube feed XML
 * - run once per minute
 * - default to 10 videos per video
 * - xml feed seems to be unreliable for start_date and slow to update, rely on pubsub
 */


export default
    async (fastify: FastifyInstance) => {
        fastify.log.info("stream-list-feed: START")

        const channels_per_crawl = parseInt(process.env.XML_FEED_API_CHANNELS_PER_RUN as string) | 10
        const currentTime = new Date()

        // list hololive channels sorted by oldest
        const targetChannels = await fastify.prisma.channel.findMany({
            where: {},
            orderBy: {
                last_updated: 'asc'
            },
            take: channels_per_crawl
        })

        const targetChannelIds = targetChannels.map(channel => {
            return channel.youtube_id
        })

        fastify.log.info(`stream_list_feed: fetching video list for ${targetChannelIds.length} channels \n ${targetChannelIds}`)

        // Convert channels into promises to fetch their feed XMLs
        const xmlFetches = targetChannels.map((crawlChannel) => (
            axios.get('https://www.youtube.com/feeds/videos.xml', {
                params: {
                    channel_id: crawlChannel.youtube_id,
                    t: Date.now(),
                },
            })
                .then((xmlResult) => {
                    // Convert xml response to json and find videos that can be upserted later
                    const data = JSON.parse(xml2json.toJson(xmlResult.data)) as XMLFeedAPIResponse
                    const entries = data.feed.entry;

                    let videos = []

                    for (const key in entries) {
                        videos.push(entries[key])
                    }

                    return videos

                })
                .catch((error) => {
                    // Catch and log error, return null to skip rest of module
                    fastify.log.error(
                        error,
                        `stream_list_feed: Error fetching video list from XML feed for channel ${crawlChannel.youtube_id}`
                    );
                    // Return an empty video list so it will not interfere succeeding processes
                    return [];
                })
        ));

        // wait for fetches to complete
        let videoList = (await Promise.all(xmlFetches)).flat()

        if (!videoList || !videoList.length) {
            fastify.log.debug(`stream_list_feed: No videos fetched`)
            return;
        } else {
            fastify.log.info(`fetched ${videoList.length} streams`)
        }

        // break down array into chunks of 50
        // fetch liveStreamingDetails from youtube API 50 videos at a time
        // upsert videos
        const chunkSize = 50;
        for (let i = 0; i < videoList.length; i += chunkSize) {
            const chunk = videoList.slice(i, i + chunkSize);

            const videos = await fetch_livestream_data(fastify, chunk);

            if (!videos) {
                continue;
            }

            // upsert fetched videos
            try {
                await saveToDb(fastify, videos, currentTime)

                fastify.log.debug(`Saved: ${videoList.map(entry => entry["yt:videoId"])}`)
                fastify.log.info(`stream_list_feed: Saved ${videoList.length} videos to database`)
            } catch (error) {
                fastify.log.error(error, `stream_list_feed: Failed to save videos ${chunk} to database`)

            }
        }

    }

/**
 * Take in videoList, fetch liveStreamingDetails from youtube api, and return video data in an upsertable format
 * @param fastify 
 * @param videoList 
 * @returns 
 */

async function fetch_livestream_data(fastify: FastifyInstance, videoList: Entry[]) {
    // find video IDs
    const videoIds = videoList.map(
        (targetVideo) => targetVideo["yt:videoId"]
    )

    fastify.log.info(`stream-list-feed: querying youtube api for ${videoIds.length} target video IDs: ${videoIds}`)

    // fetch videos
    let videoData = await fastify.youtube.videos.list({
        part: ['liveStreamingDetails'],
        hl: 'ja',
        id: videoIds,
        fields: 'items(id,liveStreamingDetails)',
        maxResults: 50
    })
        .then((ytResult) => {
            // Sanity check for YouTube respons contents
            if (!ytResult.data || !ytResult.data.items) {
                fastify.log.error(Error(`fetch_stream_status: invalid YouTube response: ${ytResult}`))
            }
            // Return video list only
            return ytResult.data.items;
        })
        .catch(
            (error) => {
                fastify.log.error({ err: error }, "fetch_stream_status: youtube fetch error")
                return;
            }
        )

    // sanity checks
    if (!videoData) {
        fastify.log.warn('fetch_stream_status: No videos fetched')
        return;
    }

    return videoList.flatMap(
        (video) => {
            const videoId = video["yt:videoId"];
            
            const index = videoData?.findIndex(
                ({ id }) => videoId === id
            )

            if (!index) {
                return;
            }

            const liveStreamingDetails = videoData?.at(index)?.liveStreamingDetails;

            if (!liveStreamingDetails) {
                return;
            }

            videoData?.splice(index, 1); // remove element to speed up future searches

            return {
                url: video.title,
                title: video.title,
                thumbnail: video["media:group"]["media:thumbnail"].url,
                youtube_id: video["yt:videoId"],
                channel_id: video["yt:channelId"],
                live: liveStreamingDetails?.activeLiveChatId ? true : false,
                start_time: liveStreamingDetails?.actualStartTime ? new Date(liveStreamingDetails?.actualStartTime) : new Date(liveStreamingDetails?.scheduledStartTime as string),
                end_time: liveStreamingDetails?.actualEndTime ? new Date(liveStreamingDetails.actualEndTime) : new Date(liveStreamingDetails.scheduledEndTime as string)
            } as Video
        }
    ) as Video[]
}

/**
 * Upsert fetched videos
 * @param fastify 
 * @param videoList 
 * @param currentTime 
 */

async function saveToDb(fastify: FastifyInstance, videoList: Video[], currentTime: Date) {
    for (const videoInfo of videoList) {
        if (!videoInfo) {
            continue;
        }

        return fastify.prisma.$transaction(
            videoList.flatMap(
                (videoInfo) => fastify.prisma.stream.upsert({
                    where: {
                        url: videoInfo.url
                    },
                    create: {
                        url: videoInfo.url,
                        title: videoInfo.title,
                        thumbnail: videoInfo.thumbnail,
                        youtube_id: videoInfo.youtube_id,
                        live: videoInfo.live,
                        last_updated: currentTime,
                        start_date: videoInfo.start_time,
                        end_date: videoInfo.end_time,
                        channel: {
                            connect: {
                                youtube_id: videoInfo.channel_id
                            }
                        }
                    },
                    update: {
                        url: videoInfo.url,
                        title: videoInfo.title,
                        thumbnail: videoInfo.thumbnail,
                        channel: {
                            update: {
                                last_updated: currentTime
                            }
                        }
                    }
                })
            )
        )
    }

}