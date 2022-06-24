import { FastifyPluginAsync } from "fastify"

interface IQueryString {
    before?: string;
    after?: string;
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
        let before_date = new Date(Date.now() + (14 * 24 * 60 * 60 * 60 * 1000)); // default to today + 14d
        let after_date = new Date(0);

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
                        lte: before_date
                    }
                }
            })

            return {
                "status": 200,
                "data": data
            }
        } catch (error) {
            throw {
                statusCode: 400,
                message: "HTTP Error 400 Bad Request"
            }
        }
    })
}
export default stream;
