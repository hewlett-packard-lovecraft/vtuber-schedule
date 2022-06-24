import { FastifyPluginAsync } from "fastify";
import fp from 'fastify-plugin'
import { SimpleIntervalJob, ToadScheduler } from "toad-scheduler";

// import tasks
import itsukaralink from "./tasks/itsakuralink-api";
import streamListFeed from "./tasks/stream-list-feed";
import streamStatus from "./tasks/stream-status"

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
            minutes: parseInt(process.env.ITSAKURALINK_CRAWLER_INTERVAL as string) || 10,
        },
        itsukaralink,
        "itsakuralink_crawler",
    )

    // fetch new videos from youtube XML feed API
    const streamListFeedJob = new SimpleIntervalJob(
        {
            minutes: parseInt(process.env.XML_FEED_API_CRAWLER_INTERVAL as string) || 2,
        },
        streamListFeed,
        "stream_list_feed"
    )

    const streamStatusJob = new SimpleIntervalJob(
        {
            minutes: parseInt(process.env.STREAM_LIST_FEED_INTERVAL as string) || 15
        },
        streamStatus,
        "stream_status"
    )

    // log crawler
    fastify.log.info('Crawler started at %s', new Date());

    // load tasks
    scheduler.addSimpleIntervalJob(itsukaralinkJob)
    scheduler.addIntervalJob(streamListFeedJob)
    scheduler.addIntervalJob(streamStatusJob)


    // attach the Toad Scheduler instance to fastify & stop on server close
    fastify.decorate("scheduler", scheduler);
    fastify.decorate("lastUpdated", new Date())

    fastify.addHook("onClose", (fastify) => {
        fastify.scheduler.stop();
    });
})

export default crawlerPlugin;