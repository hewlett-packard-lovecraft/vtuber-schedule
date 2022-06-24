import Fastify from "fastify";
import { AsyncTask } from "toad-scheduler";

const fastify = Fastify()

/**
 * stream-info
 * - fetch information of <50 upcoming videos and update database
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
                (error) => {
                    fastify.log.error({ err: error }, "fetch_video_status: youtube fetch error")
                    return;
                }
            )

        // sanity checks
        if (!videoData) {
            fastify.log.warn('fetch_video_status: No videos fetched')
            return;
        }

        // save data to db
        const saveDb = targetStreams.map((video) => {
            const videoID = String(video.url.split('?v=')[1])
            const videoInfo = videoData.find((ytVideoItem) => ytVideoItem.id === videoID);

            // sanity check
            if (!videoInfo) {
                fastify.log.debug(`fetch_video_status: ${videoID} not returned by youtube`)

                return prisma.stream.update({ // return empty PrismaPromise that always succeed
                    where: {
                        url: video.url
                    },
                    data: {
                        last_updated: currentDate
                    }
                });
            }

            // sanity check
            const liveStreamingDetails = videoInfo.liveStreamingDetails;

            if (!liveStreamingDetails || !liveStreamingDetails.scheduledStartTime || !liveStreamingDetails.scheduledEndTime) {
                fastify.log.debug(`fetch_video_status: Invalid response from youtube for ${videoID}`)

                return prisma.stream.update({ // update nothing
                    where: {
                        url: video.url
                    },
                    data: {
                        last_updated: currentDate
                    }
                })
            }


            // endless sanity checks
            const savedInfo = {
                end_date: video.end_date,
                start_date: video.start_date,
                live: false,
                updated_at: currentDate
            }

            // set start_date to scheduledStartTime if actualStartTime is undefined
            if (liveStreamingDetails.actualStartTime) {
                savedInfo.start_date = new Date(liveStreamingDetails.actualStartTime as string)
            } else if (new Date(liveStreamingDetails.scheduledStartTime as string) > currentDate) {
                savedInfo.start_date = new Date(liveStreamingDetails.scheduledStartTime)
            }

            // set end_date to scheduledEndTime if actualEndTime is undefined
            if (liveStreamingDetails.actualEndTime) {
                savedInfo.end_date = new Date(liveStreamingDetails.actualEndTime as string)
            } else if (liveStreamingDetails.scheduledEndTime) {
                savedInfo.end_date = new Date(liveStreamingDetails.scheduledEndTime)
            }

            // the stream is currently live if chat is active or start date is after current time
            if (liveStreamingDetails.activeLiveChatId || savedInfo.start_date > currentDate) {
                savedInfo.live = true;
            }

            return prisma.stream.update({
                where: {
                    url: video.url
                },
                data: {
                    start_date: savedInfo.start_date,
                    end_date: savedInfo.end_date,
                    live: savedInfo.live,
                    last_updated: savedInfo.updated_at
                }
            });

        })

        try {
            await prisma.$transaction(saveDb)
            fastify.log.info(`fetch_video_status: Successfully saved to database`)
        } catch (error) {
            fastify.log.error("fetch_video_status: Unable to save to database", { err: error })
        }

    },
    (error) => { fastify.log.error({ err: error }, "fetch_video_status: uncaught error") }
)
