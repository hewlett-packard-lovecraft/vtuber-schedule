"""
Get video list for X channels via YouTube rss feed and updates database

* Run only once per minute
* Default to 10 videos per crawl
* slow to update, rely on pubsub

"""

from datetime import datetime
from pydantic import ValidationError
import xmltodict, requests
from dateutil.parser import isoparse
from sqlalchemy.orm import attributes

from ..logger import crawler_logger
from .pydantic_dataclasses import VideoInfo, YTFeedResponseObject, EntryItem, Feed
from .video_status import get_yt_videoinfo
from db import Session, Channel, Stream
from modules.env import VIDEOLIST_RSS_CHANNELS_PER_CRAWL


def videolist_rss() -> None:
    """Get video list for X channels via YouTube rss feed"""

    logger = crawler_logger.getChild("videolist_rss")
    logger.info("START")

    try:
        with Session() as session:
            channel_ids = [
                str(id[0])
                for id in (
                    session.query(Channel.youtube_id)
                    .order_by(Channel.time_updated.asc())
                    .limit(VIDEOLIST_RSS_CHANNELS_PER_CRAWL)
                    .all()
                )
            ]  # fetch 10 channels with lowest update_time

            logger.debug(
                f"Fetching videolist for {len(channel_ids)} channels \n {channel_ids}"
            )

            channels_to_be_updated = []
            video_counter = 0

            responses = [
                requests.get(
                    "https://www.youtube.com/feeds/videos.xml",
                    params={
                        "channel_id": str(channel_id),
                        "t": datetime.now().isoformat(),
                    },
                )
                for channel_id in channel_ids
            ]  # swap this in for aiohttp.requests later

            for response in responses:
                if response.ok != True:
                    try:
                        response.raise_for_status()
                    except:
                        logger.exception(f"GET request to {response.url} failed")
                    return

                response_data = xmltodict.parse(response.content)

                response_object = []

                try:
                    response_object = YTFeedResponseObject(feed=response_data["feed"])
                except ValidationError as e:
                    logger.warning(
                        f"Invalid response from youtube for {response.url}, skipping",
                        exc_info=e,
                    )

                    continue

                if response_object == []:
                    continue

                # Filter out videos already in database
                new_videos: list[EntryItem] = []
                channel_id = response_object.feed.yt_channelId

                for entry in response_object.feed.entry:
                    if (
                        session.query(Stream.youtube_id)
                        .filter_by(youtube_id=entry.yt_videoId)
                        .scalar()
                        == None
                    ):
                        new_videos.append(entry)

                if new_videos == []:
                    logger.debug(f"No new videos for channel {channel_id}")
                    continue

                logger.debug(
                    f"Fetched {len(new_videos)} new videos / {len(response_object.feed.entry)} total for channel {channel_id}"
                )

                # get liveStreamingDetails for videos from YouTube
                youtube_results = get_yt_videoinfo(
                    [video.yt_videoId for video in new_videos], logger
                )

                if youtube_results == []:
                    logger.warning(
                        "Invalid response from YouTube API - video(s) removed?"
                    )
                    continue
                else:
                    video_counter += len(youtube_results)  # log # of videos

                # save fetched videos to database
                channel: Channel = (
                    session.query(Channel)
                    .filter(Channel.youtube_id == channel_id)
                    .scalar()
                )

                for videoinfo in youtube_results:
                    channel.streams.append(
                        Stream(
                            title=videoinfo.title,
                            youtube_url=(
                                "https://www.youtube.com/watch?v=" + videoinfo.video_id
                            ),
                            youtube_id=videoinfo.video_id,
                            thumbnail=videoinfo.thumbnail,
                            start_time=isoparse(str(videoinfo.start_time)),
                            end_time=isoparse(str(videoinfo.end_time)),
                            live=videoinfo.live,
                        )
                    )

                attributes.flag_modified(
                    channel, "name"
                )  # manually flag as modified to trigger Channel.update_time(onupdate=func.now())
                channels_to_be_updated.append(channel)

            try:
                session.add_all(channels_to_be_updated)
                session.commit()

                logger.info(
                    f"Updated {len(channels_to_be_updated)} channels with {video_counter} videos to database"
                )
            except:
                logger.exception("Failed to save videos to database")

    except:
        logger.exception("Exception")
