import { FastifyPluginAsync } from "fastify"

interface IQueryString {
    group_name: string;
    before: string;
    after: string;
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
            const query = request.query;

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
                status: 200,
                data: data
            }
        } catch {
            throw {
                statusCode: 404,
                message: `Group ${request.query.group_name} not found`
            }

        }
    })
}

export default group;
