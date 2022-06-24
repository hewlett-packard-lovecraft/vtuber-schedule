import Fastify from "fastify";
import { AsyncTask } from "toad-scheduler";
import axios from "axios";
import { ResponseData } from './types'

const itsakura_url = "https://api.itsukaralink.jp/v1.2/events.json";

const fastify = Fastify({
    logger: true
});

/**
 * itsukaralink-api
 * - fetch nijsanji JP streams from https://api.itsukaralink.jp/v1.2/events.json
 */

export default new AsyncTask(
    'itsukaralink_crawler',
    async () => {
        fastify.log.info("itsakuralink_crawler: START")

        const response = await axios({
            method: 'get',
            url: itsakura_url,
            responseType: 'json'
        })

        if (response.status === 200) {
            const body = await response.data as ResponseData

            fastify.log.info('itsakuralink_crawker: Fetched stream list ', body)

            await updateDb(body)

            fastify.log.info('itsakuralink_crawler: Saved stream list')
        } else {
            fastify.log.error(Error(`HTTP Error Response: ${response.status} ${response.statusText}`), `itsakuralink_crawler: itsakuralink fetch error: ${response.status}`)
        }
    },
    (error) => {
        fastify.log.error(error, 'itsakuralink_crawler: Uncaught error ');
    }
)


const updateDb = async (data: ResponseData) => {
    const events = data.data.events
    const currentTime = new Date();
    const prisma = fastify.prisma;

    if (!events) {
        fastify.log.warn('itsakuralink_crawler: No streams fetched')
        return;
    }

    for (const eventKey in events) {
        const event = events[eventKey];

        await prisma.stream.upsert({
            where: {
                url: event.url
            },
            update: {
                url: event.url,
                title: event.name,
                thumbnail: event.thumbnail,
                live: false,
                last_updated: currentTime,
                start_date: new Date(event.startDate),
                end_date: new Date(event.endDate),
            },
            create: {
                url: event.url,
                title: event.name,
                thumbnail: event.thumbnail,
                live: false,
                last_updated: new Date(),
                start_date: new Date(event.startDate),
                end_date: new Date(event.endDate),
                channel: {
                    connectOrCreate: {
                        where: {
                            channel_name: event.livers[0].name,
                        },
                        create: {
                            channel_name: event.livers[0].name,
                            avatar: event.livers[0].avatar,
                            youtube: "",
                            youtube_id: event.livers[0].name,
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
}
