import fp from "fastify-plugin";
import { google, youtube_v3 } from "googleapis"

/**
 * This plugin creates a youtubev3 client and exposes it to the rest of the application
 *
 * @see https://github.com/fastify/fastify-helmet
 * @see https://github.com/expressjs/cors
 */

declare module 'fastify' {
    interface FastifyInstance {
        youtube: youtube_v3.Youtube

    }
}

export default fp(async (fastify, opts) => {

    const youtube = google.youtube({
        version: 'v3',
        auth: process.env.GOOGLE_API_KEY
    })

    fastify.decorate("youtube", youtube)
})