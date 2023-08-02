""" Create Pydantic dataclasses """

from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field
from dataclasses import dataclass


# video_status.py


@dataclass
class VideoInfo:
    """VideoInfo object"""

    video_id: str
    title: str
    thumbnail: str
    channel_id: str
    channel_name: str
    live: bool
    start_time: str
    end_time: str


### videolist_nijisanji.py


class GenreItem(BaseModel):
    id: int
    name: str


class Liver(BaseModel):
    id: int
    name: str
    avatar: str
    color: str


class Event(BaseModel):
    id: int
    name: str
    description: str
    public: int
    url: str
    thumbnail: str
    start_date: str
    end_date: str
    recommend: bool
    genre: Optional[GenreItem]
    livers: List[Liver]


class Data(BaseModel):
    events: List[Event]


class ItsakuralinkAPIResponse(BaseModel):
    """api.itsakuralink.jp response object"""

    status: str
    data: Data


### videolist_rss.py


class LinkItem(BaseModel):
    _rel: str = Field(..., alias="@rel")
    _href: str = Field(..., alias="@href")


class Author(BaseModel):
    name: str
    uri: str


class Link(BaseModel):
    _rel: str = Field(..., alias="@rel")
    _href: str = Field(..., alias="@href")


class Author1(BaseModel):
    name: str
    uri: str


class MediaContent(BaseModel):
    _url: str = Field(..., alias="@url")
    _type: str = Field(..., alias="@type")
    _width: str = Field(..., alias="@width")
    _height: str = Field(..., alias="@height")


class MediaThumbnail(BaseModel):
    _url: str = Field(..., alias="@url")
    _width: str = Field(..., alias="@width")
    _height: str = Field(..., alias="@height")


class MediaStarRating(BaseModel):
    _count: str = Field(..., alias="@count")
    _average: str = Field(..., alias="@average")
    _min: str = Field(..., alias="@min")
    _max: str = Field(..., alias="@max")


class MediaStatistics(BaseModel):
    _views: str = Field(..., alias="@views")


class MediaCommunity(BaseModel):
    media_starRating: MediaStarRating = Field(..., alias="media:starRating")
    media_statistics: MediaStatistics = Field(..., alias="media:statistics")


class MediaGroup(BaseModel):
    media_title: str = Field(..., alias="media:title")
    media_content: MediaContent = Field(..., alias="media:content")
    media_thumbnail: MediaThumbnail = Field(..., alias="media:thumbnail")
    media_description: Optional[str] = Field(..., alias="media:description")
    media_community: MediaCommunity = Field(..., alias="media:community")


class EntryItem(BaseModel):
    id: str
    yt_videoId: str = Field(..., alias="yt:videoId")
    yt_channelId: str = Field(..., alias="yt:channelId")
    title: str
    link: Link
    author: Author1
    published: str
    updated: str
    media_group: MediaGroup = Field(..., alias="media:group")


class Feed(BaseModel):
    _xmlns_yt: str = Field(..., alias="@xmlns:yt")
    _xmlns_media: str = Field(..., alias="@xmlns:media")
    _xmlns: str = Field(..., alias="@xmlns")
    link: List[LinkItem]
    id: str
    yt_channelId: str = Field(..., alias="yt:channelId")
    title: str
    author: Author
    published: str
    entry: List[EntryItem]


class YTFeedResponseObject(BaseModel):
    """YouTube feed response object"""

    feed: Feed
