import Fastify from 'fastify'
import prismaPlugin from '../../src/plugins/prisma'

/**
 * crawlerHelper
 * This function registers and loads plugins needed for crawler tests
 */
export default async () => {
    const fastify = Fastify({
        logger: true
    })

    void fastify.register(prismaPlugin)
    await fastify.ready()

    return fastify;
}