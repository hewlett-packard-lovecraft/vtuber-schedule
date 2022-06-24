import Fastify from "fastify";
import { AsyncTask } from "toad-scheduler";

const fastify = Fastify()

/**
 * stream-info
 * - fetch information of upcoming videos and update database
 * - prioritize live videos then videos with lowest updated_at
 * - 50 videos per query
 * - run once per minute
 */

export default new AsyncTask(
    'fetch video info',
    async () => {
        const youtube = fastify.youtube;
        const prisma = fastify.prisma;

        // get current time
        const currentDate = new Date()

        // find currently live videos
        const targetStreams = await prisma.stream.findMany(
            {
                where: {
                    live: true
                }
            }
        )

        // if target_streams <50, append lowest last_updated to list
        targetStreams.concat(
            targetStreams,
            await prisma.stream.findMany(
                {
                    where: {
                        start_date: {
                            gte: currentDate
                        }
                    },
                    orderBy: {
                        last_updated: 'asc'
                    },
                    take: 50 - targetStreams.length
                }
            )
        )

        // fetch video data from youtube
        const targetVideoIDs = targetStreams.map(
            (targetVideo) => String(targetVideo.url.split('?v=')[1])
        )

        fastify.log.info(`fetch_video_status: target video IDs: ${targetVideoIDs}`)

        const videoData = await youtube.videos.list({
            part: ['liveStreamingDetails'],
            id: targetVideoIDs,
            hl: 'ja',
            fields: 'items(id,liveStreamingDetails)',
            maxResults: 50
        })
            .then((ytResult) => {
                // Sanity check for YouTube respons contents
                if (!ytResult.data || !ytResult.data.items) {
                    fastify.log.error(Error(`fetch_video_status: invalid YouTube response: ${ytResult}`))
                }
                // Return video list only
                return ytResult.data.items;
            })
            .catch(
                (err) => {
                    fastify.log.error(err, "fetch_video_status: youtube fetch error")
                    return;
                }
            )

        // sanity checks
        if (!videoData) {
            fastify.log.warn('fetch_video_status: No videos fetched')
            return;
        }

        // save data to db
        


    },
    (err) => { fastify.log.error(err, "fetch_video_status: uncaught error") }
)
