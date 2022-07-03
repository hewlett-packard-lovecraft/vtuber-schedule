import { FastifyPluginAsync } from "fastify"

interface IQueryString {
    before: string;
    after: string;
}

interface IHeaders {
    'h-Custom': string;
}

const stream: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get<{
        Querystring: IQueryString,
        Headers: IHeaders
    }>('/stream/', async function (request, reply) {
        const query = request.query;
        fastify.log.info(query)

        let before_date = new Date(Date.now() + (2 * 24 * 60 * 60 * 1000)); // default to today + 2d
        let after_date = new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)); // default to today - 2d

        if (query.before) {
            before_date = new Date(query.before);
        }

        if (query.after) {
            after_date = new Date(query.after);
        }

        try {
            const data = await fastify.prisma.stream.findMany({
                where: {
                    start_date: {
                        gte: after_date,
                        lt: before_date
                    }
                }
            })

            return { streams: data };

        } catch (error) {
            fastify.log.error(Error)

            throw {
                statusCode: 400,
                message: "HTTP Error 400 Bad Request"
            }
        }
    })
}
export default stream;
