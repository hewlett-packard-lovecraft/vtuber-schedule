import { FastifyPluginAsync } from "fastify"

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get('/organization/', async function (request, reply) {
        return 'stream endpoint'
    })
}

export default example;
