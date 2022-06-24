import fp from "fastify-plugin";
import fastifyCors, { FastifyCorsOptions } from "@fastify/cors";

/**
 * This plugin adds support for cors
 * 
 * @see https://github.com/fastify/fastify-helmet
 * @see https://github.com/expressjs/cors
 */

export default fp<FastifyCorsOptions>(async (fastify, opts) => {
    fastify.register(fastifyCors, {
        // set options later
    })
})