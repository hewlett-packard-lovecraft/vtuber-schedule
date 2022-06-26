import { FastifyPluginAsync } from "fastify"

interface IQueryString {
    group_name: string;
    before?: string;
    after?: string;
}

interface IHeaders {
    'h-Custom': string;
}

const group: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get<{
        Querystring: IQueryString,
        Headers: IHeaders
    }>('/group/', async function (request, reply) {
        try {
            const prisma = fastify.prisma;
            const query: IQueryString = request.query;

            if (!query.group_name) {
                return prisma.group.findMany({
                    include: {
                        channels: {
                            include: {
                                streams: true
                            }
                        }
                    }
                })
            }

            const data = await prisma.group.findUnique({
                where: {
                    group_name: query.group_name,
                },
                include: {
                    channels: {
                        include: {
                            streams: true
                        }
                    }
                }
            })

            return {
                group: data
            }
        } catch {
            return this.httpErrors.notFound
        }
    })
}

export default group;
