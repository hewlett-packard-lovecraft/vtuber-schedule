"""
Update channel title, thumbnail, and avatar with YouTube API

"""

from db.connect import Session
from db.models.models import Channel
from ..logger import crawler_logger


def channel_info() -> None:
    """Update channel title, thumbnail, and avatar with YouTube API"""
    logger = crawler_logger.getChild("channel_info")

    try:
        with Session() as session:
            channels = session.query(Channel).all()

            for (index, channel) in enumerate(channels):
                channellist_chunk = []
                channellist_chunk.append(channel)

                if len(channellist_chunk) == 50 or index == len(channels)-1:
                    print()

    except:
        logger.exception("Exception")

def get_yt_channel_info(id_list: list[Channel])):
    """ """
