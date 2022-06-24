import fp from 'fastify-plugin'
import fastifyHelmet, { FastifyHelmetOptions } from '@fastify/helmet'

/**
 * This plugin adds support for helmet
 * 
 * @see https://github.com/fastify/fastify-helmet
 * @see https://www.npmjs.com/package/helmet
 */


export default fp<FastifyHelmetOptions>(async (fastify, opts) => {
    fastify.register(fastifyHelmet, {
        global: true
    })
})