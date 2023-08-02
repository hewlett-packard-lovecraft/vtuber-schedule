"""
Fetch liveStreamStatus of <50 videos from YouTube API and update database
* one run per minute should be sufficien)t
* removes the video if it's been privated

Fetch priority:
* live videos
* oldest updated_at <1d
* oldest updated_at <2d

"""


from logging import Logger
from datetime import datetime, timedelta
from re import A
from dateutil import parser

from db.models.models import Stream

from ..logger import crawler_logger
from .pydantic_dataclasses import VideoInfo
from modules.youtube import youtube
from db import Session


def video_status() -> None:
    """Fetch liveStreamStatus of <50 videos from YouTube API and update database"""
    logger = crawler_logger.getChild("video_status")
    logger.info("START")

    try:
        session = Session()

        streams = (
            session.query(Stream).order_by(Stream.time_updated.asc()).limit(50).all()
        )  # prioritize live videos

        if len(streams) < 50:
            streams += (
                session.query(Stream)
                .order_by(
                    Stream.time_updated.between(
                        datetime.utcnow(), datetime.utcnow() - timedelta(days=1)
                    ).asc()
                )
                .limit(50 - len(streams))
            )

            if len(streams) < 50:
                streams += session.query(Stream).order_by(
                    Stream.time_updated.between(
                        datetime.utcnow(), datetime.utcnow() - timedelta(days=2)
                    ).asc()
                )

        video_ids = [str(stream.youtube_id) for stream in streams]
        logger.debug(f"Video IDs: {video_ids} ")

        # get videoinfo from youtube API
        yt_results = get_yt_videoinfo(video_ids, logger)

        if yt_results == []:
            logger.debug("Invalid response from YouTUbe API, exiting")
            return

        for videoinfo in yt_results:
            session.query(Stream).filter_by(youtube_id=videoinfo.channel_id).update(
                {
                    Stream.title: videoinfo.title,
                    Stream.thumbnail: videoinfo.thumbnail,
                    Stream.start_time: parser.isoparse(videoinfo.start_time),
                    Stream.end_time: parser.isoparse(videoinfo.end_time),
                    Stream.live: videoinfo.live,
                },
                synchronize_session="evaluate",
            )

        # delete videos not in results / privated videos
        deleted_counter = 0
        yt_results_video_ids = [result.video_id for result in yt_results]

        for video_id in video_ids:
            if (video_id in yt_results_video_ids) != True:
                session.query(Stream).filter_by(youtube_id=video_id).delete(
                    synchronize_session="evaluate"
                )

                deleted_counter += 1

        # save videos to database
        try:
            session.commit()

            logger.info(
                f"Updated {len(yt_results)} and deleted {deleted_counter} videos"
                + f" \n {[str(stream.video_id) for stream in yt_results]}"
            )
        except:
            logger.exception(f"Failed to update {len(yt_results)} videos")

    except:
        logger.exception("Exception")


def get_yt_videoinfo(videoid_list: list[str], logger: Logger) -> list[VideoInfo]:
    """Take a list of videosIDs, split into chunks of 50, and fetch liveStreamingDetails from YouTube API"""

    logger.debug(
        f"get_yt_videoinfo: querying YouTube API for {len(videoid_list)} videos"
    )

    videoidlist_chunks = [
        videoid_list[i : i + 50] for i in range(0, len(videoid_list), 50)
    ]  # split videolist to chunks of 50

    try:
        results: list[VideoInfo] = []

        for video_ids in videoidlist_chunks:
            request = youtube.videos().list(
                part=["liveStreamingDetails", "snippet", "id"],
                hl="ja",
                id=",".join(video_ids),
                fields="items(id,snippet,liveStreamingDetails)",
                maxResults=50,
            )

            response = request.execute()

            for item in response["items"]:
                item_info = VideoInfo(
                    video_id=item["id"],
                    title=item["snippet"]["title"],
                    thumbnail=item["snippet"]["thumbnails"]["default"]["url"],
                    channel_id=item["snippet"]["channelId"],
                    channel_name=item["snippet"]["channelTitle"],
                    live=False,
                    start_time=str(datetime.now()),
                    end_time=str(
                        datetime.now() + timedelta(days=7)
                    ),  # default to today + 7d - video_status will pick it up when stream ends
                )

                if "liveStreamingDetails" in item.keys():
                    item_info.start_time = item["liveStreamingDetails"][
                        "scheduledStartTime"
                    ]
                    if "actualStartTime" in item["liveStreamingDetails"].keys():
                        # default to actualStartTime and actualEndTime if possible
                        item_info.start_time = item["liveStreamingDetails"][
                            "actualStartTime"
                        ]

                    if "actualEndTime" in item["liveStreamingDetails"]:
                        item_info.end_time = item["liveStreamingDetails"][
                            "actualEndTime"
                        ]

                    if "activeLiveChatId" in item["liveStreamingDetails"]:
                        item_info.live = True

                else:
                    item_info.start_time = item["snippet"]["publishedAt"]
                    item_info.end_time = item["snippet"]["publishedAt"]

                results.append(item_info)

        return results

    except:
        logger.exception("YouTube fetch error")
        return []
