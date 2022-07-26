import { FastifyInstance } from "fastify";

/**
 * stream-info
 * - This function fetches information of <50 upcoming videos and update database
 * - prioritize live videos then videos with lowest updated_at
 * - 50 videos per query
 * - run once per minute
 */

const streamStatus = async (fastify: FastifyInstance) => {
    fastify.log.info(`fetch_stream_status: START`);

    const youtube = fastify.youtube;
    const prisma = fastify.prisma;

    // get current time
    const currentDate = new Date()

    // find currently live videos
    let targetStreams = await prisma.stream.findMany(
        {
            where: {
                live: true
            },
            take: 50
        }
    )

    if (targetStreams.length < 50) {
        // if target_streams <50, append past 2 day's lowest last_updated videos
        targetStreams = targetStreams.concat(
            targetStreams,
            await prisma.stream.findMany(
                {
                    where: {
                        start_date: {
                            gte: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000) // 2d before
                        }
                    },
                    orderBy: {
                        last_updated: 'asc'
                    },
                    take: 50 - targetStreams.length
                }
            )
        )
    }

    else if (targetStreams.length < 50) {
        // if target_streams is still <50 then append lowest last_updated videos of all time
        targetStreams = targetStreams.concat(
            targetStreams,
            await prisma.stream.findMany(
                {
                    orderBy: {
                        last_updated: 'asc'
                    },
                    take: 50 - targetStreams.length
                }
            )
        )
    }

    // find video IDs
    const targetVideoIDs = targetStreams.map(
        (targetVideo) => targetVideo.youtube_id
    )

    fastify.log.info(`fetch_stream_status: ${targetVideoIDs.length} target video IDs: ${targetVideoIDs}`)

    // fetch videos
    const videoData = await youtube.videos.list({
        part: ['liveStreamingDetails'],
        hl: 'ja',
        id: targetVideoIDs,
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

    // save data to db
    const saveDb = targetStreams.map((video) => {
        const videoID = String(video.url.split('?v=')[1])
        const videoInfo = videoData.find((ytVideoItem) => ytVideoItem.id === videoID);

        // sanity check
        if (!videoInfo) {
            fastify.log.debug(`fetch_stream_status: ${videoID} not returned by youtube`)

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
            fastify.log.debug(`fetch_stream_status: Invalid response from youtube for ${videoID}`)

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
        let savedInfo = {
            end_date: new Date(liveStreamingDetails.scheduledEndTime),
            start_date: new Date(liveStreamingDetails.scheduledStartTime),
            live: false,
            updated_at: currentDate
        }

        if (liveStreamingDetails.actualStartTime) {
            savedInfo.start_date = new Date(liveStreamingDetails.actualStartTime);
        }

        if (liveStreamingDetails.actualEndTime) {
            savedInfo.end_date = new Date(liveStreamingDetails.actualEndTime);
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
                last_updated: savedInfo.updated_at,
                channel: {
                    update: {
                        last_updated: savedInfo.updated_at
                    }
                }
            }
        });

    })

    try {
        await prisma.$transaction(saveDb)
        fastify.log.info(`fetch_stream_status: Successfully saved to database`)
    } catch (error) {
        fastify.log.error("fetch_stream_status: Failed to save to database", { err: error })
    }

}

export default streamStatus;