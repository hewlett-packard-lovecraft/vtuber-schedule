"""
Fetch Nijisanji JP stream list from their official scheduling site and update database

* Run once per hour
* https://api.itsukaralink.jp/v1.2/events.json
"""

import requests

from dateutil.parser import isoparse
from pydantic import ValidationError

from ..logger import crawler_logger
from .video_status import get_yt_videoinfo
from .pydantic_dataclasses import ItsakuralinkAPIResponse, VideoInfo
from db import Session, Stream, Channel, Group


def videolist_nijisanji() -> None:
    logger = crawler_logger.getChild("videolist_nijisanji")
    logger.info("START")

    try:
        print()
        session = Session()

        response = requests.get("https://api.itsukaralink.jp/v1.2/events.json")

        if response.ok is not True:
            try:
                response.raise_for_status()
            except:
                logger.exception("GET request to api.itsakuralink.jp failed")
            return

        response_json = response.json()
        response_object = []

        try:
            response_object = ItsakuralinkAPIResponse(
                status=response_json.get("status"), data=response_json.get("data")
            )
        except ValidationError as e:
            logger.warning(
                "Unable to deserialize response from "
                + "https://api.itsukaralink.jp/v1.2/events.json"
                + " , exiting",
                exc_info=e,
            )
            return

        if response_object == []:
            logger.warning(
                "Unable to deserialize response from "
                + "https://api.itsukaralink.jp/v1.2/events.json"
                + " , exiting",
            )

            return

        videolist_ids = []

        # filter out events already in database
        for event in response_object.data.events:
            if (
                session.query(Stream.youtube_url)
                .filter_by(youtube_url=event.url)
                .first()
                is None
            ):
                videolist_ids.append(event.url.split("?v=")[1])

        logger.debug(
            f"Fetched {len(videolist_ids)} new videos / {len(response_object.data.events)} total "
            + f"\n ({','.join(videolist_ids)})"
        )

        if len(videolist_ids) == 0:
            logger.debug("No new videos fetched")
            return

        # query youtube API for event's start_time, channel_id, end_time
        youtube_results: list[VideoInfo] = get_yt_videoinfo(videolist_ids, logger)

        if youtube_results == []:
            logger.warning("Invalid response from YouTube API - video(sw) removed?")
            return

        ### Save to database
        nijisanji_jp: Group = (
            session.query(Group)
            .filter_by(name="NIJISANJI JP", org_name="Nijisanji")
            .scalar()
        )

        channel_counter = 0

        for videoinfo in youtube_results:
            channel = (
                session.query(Channel)
                .filter_by(youtube_id=videoinfo.channel_id)
                .scalar()
            )

            stream = Stream(
                title=videoinfo.title,
                youtube_url=("https://www.youtube.com/watch?v=" + videoinfo.video_id),
                youtube_id=videoinfo.video_id,
                thumbnail=videoinfo.thumbnail,
                start_time=isoparse(str(videoinfo.start_time)),
                end_time=isoparse(str(videoinfo.end_time)),
                live=videoinfo.live,
            )

            if channel == None:
                channel = Channel(
                    name=videoinfo.channel_name,
                    youtube_url=(
                        "https://www.youtube.com/channel/" + str(videoinfo.channel_id)
                    ),
                    youtube_id=videoinfo.channel_id,
                )  # create channel if not exists

                channel.streams.append(stream)
                nijisanji_jp.channels.append(channel)
                channel_counter += 1

            else:
                channel.streams.append(stream)

        try:
            session.add(nijisanji_jp)
            session.commit()
            logger.info(
                f"Saved {len(youtube_results)} videos and {channel_counter} channels to database"
            )
        except:
            logger.exception("Failed to save to database")

    except:
        logger.exception("Uncaught exception")


if __name__ == "__main__":
    videolist_nijisanji()
