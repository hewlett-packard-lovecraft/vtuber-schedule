import { FastifyInstance } from "fastify";
import axios from "axios";
import { ResponseData } from './types'

const itsakura_url = "https://api.itsukaralink.jp/v1.2/events.json";


/**
 * itsukaralink-api
 * - This function fetches nijsanji JP streams from https://api.itsukaralink.jp/v1.2/events.json
 */

export default
    async (fastify: FastifyInstance) => {
        fastify.log.info("itsakuralink_crawler: START")

        const response = await axios({
            method: 'get',
            url: itsakura_url,
            responseType: 'json'
        })

        if (response.status === 200) {
            const body = JSON.parse(await response.data) as ResponseData
            const events = body.data.events
            const prisma = fastify.prisma;

            if (!events) {
                fastify.log.warn('itsakuralink_crawler: No streams fetched')
                return;
            }

            const videoIDs = events.map(
                (event) => event.url.split('?v=')[1]
            );

            fastify.log.info(`itsakuralink_crawker: Fetched ${videoIDs.length} streams: \n ${videoIDs}`)

            const dbSaves = events.map(
                (event) => {

                    if (!event || !event.url || !event.name || !event.thumbnail || !event.startDate || !event.endDate) {
                        fastify.log.debug(event, `itsakuralink_crawler: invalid event`)
                        return prisma.stream.count(); // do nothing and skip to next Event
                    }

                    const eventInfo = event;

                    // add sanity checks
                    const videoID = String(eventInfo.url.split('?v=')[1])


                    return prisma.stream.upsert({
                        where: {
                            url: eventInfo.url
                        },
                        update: {
                            url: eventInfo.url,
                            title: eventInfo.name,
                            thumbnail: eventInfo.thumbnail,
                        },
                        create: {
                            url: eventInfo.url,
                            title: eventInfo.name,
                            thumbnail: eventInfo.thumbnail,
                            youtube_id: videoID,
                            live: false,
                            last_updated: new Date(),
                            start_date: new Date(eventInfo.startDate),
                            end_date: new Date(eventInfo.endDate),
                            channel: {
                                connectOrCreate: {
                                    where: {
                                        channel_name: eventInfo.livers[0].name,
                                        youtube_id: eventInfo.livers[0].name,
                                    },
                                    create: {
                                        channel_name: eventInfo.livers[0].name,
                                        avatar: eventInfo.livers[0].avatar,
                                        youtube: "",
                                        youtube_id: eventInfo.livers[0].name,
                                        twitter: "",
                                        group: {
                                            connect: {
                                                group_name: "NIJISANJI JP"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
            )

            try {
                await prisma.$transaction(dbSaves);
                fastify.log.info('itsakuralink_crawler: Saved stream list')
            } catch (error) {
                fastify.log.error('itsakuralink_crawler: Failed to save stream list', { err: error } )   
            }

        } else {
            fastify.log.error({ err: Error(`HTTP Error Response: ${response.status} ${response.statusText}`) }, `itsakuralink_crawler: itsakuralink fetch error: ${response.status}`)
        }
    }