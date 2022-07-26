// https://app.quicktype.io/

export interface XMLFeedAPIResponse {
    feed: Feed;
}

export interface Feed {
    "xmlns:yt": string;
    "xmlns:media": string;
    xmlns: string;
    link: Link[];
    id: string;

    "yt:channelId": string;
    title: string;
    author: Author;
    published: Date;
    entry: Entry[];
}

export interface Author {
    name: string;
    uri: string;
}

export interface Entry {
    id: string;
    "yt:videoId": string;
    "yt:channelId": string;
    title: string;
    link: Link;
    author: Author;
    published: Date;
    updated: Date;
    "media:group": MediaGroup;
}

export interface Link {
    rel: string;
    href: string;
}

export interface MediaGroup {
    "media:title": string;
    "media:content": Media;
    "media:thumbnail": Media;
    "media:description": string;
    "media:community": MediaCommunity;
}

export interface MediaCommunity {
    "media:starRating": MediaStarRating;
    "media:statistics": MediaStatistics;
}

export interface MediaStarRating {
    count: string;
    average: string;
    min: string;
    max: string;
}

export interface MediaStatistics {
    views: string;
}

export interface Media {
    url: string;
    type?: string;
    width: string;
    height: string;
}

export interface Video {
    url: string;
    title: string;
    thumbnail: string;
    youtube_id: string;
    channel_id: string;
    live: boolean;
    start_time: Date;
    end_time: Date;
}