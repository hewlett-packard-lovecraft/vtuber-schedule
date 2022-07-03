import { FastifyPluginAsync } from "fastify";
import fp from 'fastify-plugin'
import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler";

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
    const currentTime = new Date()

    // Fetch list of videos from itsakuralink.jp
    const itsukaralinkJob = new SimpleIntervalJob(
        {
            minutes: parseInt(process.env.ITSAKURALINK_CRAWLER_INTERVAL as string) || 10,
        },
        new AsyncTask(
            'itsukaralink_crawler',
            () => itsukaralink(fastify)
                .then(() => {
                    fastify.lastUpdated = currentTime
                })
            ,
            (error) => {
                fastify.log.error({ err: error }, 'itsakuralink_crawler: Uncaught error ');
            }
        ),
        "itsakuralink_crawler",
    )

    // fetch new videos from youtube XML feed API
    const streamListFeedJob = new SimpleIntervalJob(
        {
            minutes: parseInt(process.env.XML_FEED_API_CRAWLER_INTERVAL as string) || 15,
        },

        new AsyncTask(
            'stream-list-feed',
            () => streamListFeed(fastify)
                .then(() => {
                    fastify.lastUpdated = currentTime
                })
            ,
            (err) => { fastify.log.error(err, `stream_list_feed: Uncaught error`) }
        ),
        'stream-list-feed',
    )

    const streamStatusJob = new SimpleIntervalJob(
        {
            minutes: parseInt(process.env.UPDATE_STREAM_STATUS_INTERVAL as string) || 2,
        },
        new AsyncTask(
            'fetch video info',
            () => streamStatus(fastify)
                .then(() => {
                    currentTime
                })
            ,
            (error) => { fastify.log.error({ err: error }, "fetch_stream_status: uncaught error") }
        ),
        "stream_status"
    )

    // log crawler
    fastify.log.info('Crawler started at %s', new Date());

    // load tasks after all plugins have been loaded
    fastify.ready().then(
        () => {
            scheduler.addSimpleIntervalJob(streamListFeedJob)
            scheduler.addSimpleIntervalJob(itsukaralinkJob)
            scheduler.addSimpleIntervalJob(streamStatusJob)
        }
    )

    // attach the Toad Scheduler instance to fastify & stop on server close
    fastify.decorate("scheduler", scheduler);
    fastify.decorate("lastUpdated", new Date())

    fastify.addHook("onClose", (fastify) => {
        fastify.scheduler.stop();
    });
})

export default crawlerPlugin;