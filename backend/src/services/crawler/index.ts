import { FastifyPluginAsync } from "fastify";
import fp from 'fastify-plugin'
import { SimpleIntervalJob, ToadScheduler } from "toad-scheduler";

// import tasks
import itsukaralink from "./tasks/itsakuralink-api";

declare module 'fastify' {

    interface FastifyInstance {

        scheduler: ToadScheduler
        lastUpdated: Date

    }

}

/**
 * This plugin periodically fetches streams and stream information from available sources
 */

const crawlerPlugin: FastifyPluginAsync = fp(async (fastify, opts) => {
    const scheduler = new ToadScheduler();

    // Fetch list of videos from itsakuralink.jp
    const itsukaralinkJob = new SimpleIntervalJob(
        {
            minutes: parseInt(process.env.ITSAKURALINK_CRAWLER_INTERVAL as string) || 5,
        },
        itsukaralink,
        "itsakuralink_crawler",
    )


    // load tasks
    scheduler.addSimpleIntervalJob(itsukaralinkJob)

    fastify.log.info('Crawler started at %s', new Date());

    // attach the Toad Scheduler instance to fastify & stop on server close
    fastify.decorate("scheduler", scheduler);
    fastify.decorate("lastUpdated", new Date())

    fastify.addHook("onClose", (fastify) => {
        fastify.scheduler.stop();
    });
})

export default crawlerPlugin;