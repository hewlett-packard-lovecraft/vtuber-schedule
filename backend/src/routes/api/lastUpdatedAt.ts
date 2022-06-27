import { FastifyPluginAsync } from "fastify"

interface IQueryString {
}

interface IHeaders {
    'h-Custom': string;
}

const channel: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get<{
        Querystring: IQueryString,
        Headers: IHeaders
    }>('/last_update_date/', async function (request, reply) {
        return { lastUpdatedAt: fastify.lastUpdated }
    })
}

export default channel;
