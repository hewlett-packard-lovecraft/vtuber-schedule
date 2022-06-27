import { FastifyPluginAsync } from "fastify"

interface IQueryString {
    channel_id: string;
    before?: string;
    after?: string;
}

interface IHeaders {
    'h-Custom': string;
}

const channel: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get<{
        Querystring: IQueryString,
        Headers: IHeaders
    }>('/channel/', async function (request, reply) {
        try {
            const prisma = fastify.prisma;
            const query: IQueryString = request.query;

            if (!query.channel_id) {
                const channels = await prisma.channel.findMany({
                    include: {
                        streams: true
                    }
                })

                return { channel: channels }
            }

            const channelIds = query.channel_id.split(',')

            const channels = channelIds.map((channelId) => {
                return prisma.channel.findUnique({
                    where: {
                        youtube_id: channelId,
                    },
                    include: {
                        streams: true
                    }
                })
            })


            return {
                channel: await Promise.all(channels)
            }
        } catch {
            return this.httpErrors.notFound
        }
    })
}

export default channel;
