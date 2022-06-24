import fp from 'fastify-plugin'
import fastifyStatic, { FastifyStaticOptions } from '@fastify/static'
import path from 'path'

/**
 * This plugin adds support for serving static files
 * 
 * @see https://github.com/fastify/fastify-static
 */


export default fp<FastifyStaticOptions>(async (fastify, opts) => {
    fastify.register(fastifyStatic, {
        root: path.join(__dirname, '..', '..', '..', 'frontend/', 'build/'),
        prefix: '/',
    })
})