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
            const body = await response.data as ResponseData

            fastify.log.info('itsakuralink_crawker: Fetched stream list ', body)


            const events = body.data.events
            const prisma = fastify.prisma;

            if (!events) {
                fastify.log.warn('itsakuralink_crawler: No streams fetched')
                return;
            }

            for (const eventKey in events) {
                const event = events[eventKey];

                if (!event || !event.url || !event.name || !event.thumbnail || !event.startDate || !event.endDate) {
                    fastify.log.debug(event, `itsakuralink_crawler: invalid event`)
                    continue;
                }

                const eventInfo = event;

                // add sanity checks
                const videoID = String(eventInfo.url.split('?v=')[1])


                await prisma.stream.upsert({
                    where: {
                        url: eventInfo.url
                    },
                    update: {
                        url: eventInfo.url,
                        title: eventInfo.name,
                        thumbnail: eventInfo.thumbnail,
                        //live: false,
                        //last_updated: currentTime,
                        //start_date: new Date(eventInfo.startDate),
                        //end_date: new Date(eventInfo.endDate),
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

            fastify.log.info('itsakuralink_crawler: Saved stream list')
        } else {
            fastify.log.error({ err: Error(`HTTP Error Response: ${response.status} ${response.statusText}`) }, `itsakuralink_crawler: itsakuralink fetch error: ${response.status}`)
        }
    }