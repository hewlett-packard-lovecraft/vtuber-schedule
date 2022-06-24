import { AsyncTask } from "toad-scheduler";
import Fastify from "fastify"
import axios from "axios";
import xml2json from "xml2json"
import { XMLFeedAPIResponse } from "./types";

const fastify = Fastify()

/**
 * stream-list-feed
 * - update stream list for hololive channels via youtube feed XML
 * - run once per minute
 * - default to 10 videos per video
 * - xml feed is slow to update, rely on pubsub
 */

export default new AsyncTask(
    'stream-list-feed',
    async () => {
        const channels_per_crawl = parseInt(process.env.STREAM_LIST_FEED_CHANNELS_PER_RUN as string) | 10
        const currentTime = new Date()

        // list hololive channels sorted by oldest
        const targetChannels = await fastify.prisma.channel.findMany({
            where: {
                group: {
                    org_name: "Hololive"
                }
            },
            orderBy: {
                last_updated: 'asc'
            },
            take: channels_per_crawl
        })

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
                        `video_list_feed: Error fetching video list from XML feed for channel ${crawlChannel.youtube_id}`
                    );
                    // Return an empty video list so it will not interfere succeeding processes
                    return [];
                })
        ));

        // wait for fetches to complete
        const videoList = (await Promise.all(xmlFetches)).flat()

        if (!videoList || !videoList.length) {
            fastify.log.debug(`video_list_feed: No videos fetched`)
            return;
        }


        const dbWrites = videoList.map((videoInfo) => {
            return fastify.prisma.stream.upsert({
                where: {
                    url: videoInfo.link.href
                },
                create: {
                    url: videoInfo.link.href,
                    title: videoInfo.title,
                    thumbnail: videoInfo["media:group"]["media:thumbnail"].url,
                    live: false,
                    last_updated: currentTime,
                    start_date: videoInfo.published, // wait for stream-status task to fetch true start/end time from youtube api
                    end_date: videoInfo.updated,
                    channel: {
                        connect: {
                            youtube_id: videoInfo["yt:channelId"]
                        }
                    }
                },
                update: {
                    url: videoInfo.link.href,
                    title: videoInfo.title,
                    thumbnail: videoInfo["media:group"]["media:thumbnail"].url,
                    last_updated: currentTime
                }
            })
        })

        try {
            await fastify.prisma.$transaction(dbWrites)
            fastify.log.info(`video_list_feed: Saved ${videoList.length} videos to database`)

            fastify.log.debug(`Saved: ${videoList.map(entry => entry["yt:videoId"])}`)
        } catch (error) {
            fastify.log.error(error, `video_list_feed: Failed to save to database`)
        }
    },
    (err) => { fastify.log.error(err, `video_list_feed: Uncaught error`) }
)
