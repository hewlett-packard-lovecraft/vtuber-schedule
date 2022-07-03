import { DateTime } from "luxon";

export interface Organization {
    name: string;
    groups: Group[];
}

export interface Group {
    groupName: string;
    orgName: string;
    channels: Channel[];
}

export interface Channel {
    channel_name: string;
    youtube_id: string;
    youtube: string;
    twitter: string;
    avatar: string;
    lastUpdated: Date;
    groupName: string;
    streams: Stream[];
}

export interface Stream {
    url: string;
    youtube_id: string;
    title: string;
    thumbnail: string;
    live: boolean;
    lastUpdated: string;
    start_date: string;
    end_date: string;
    channel_name: string;
}

export interface StreamCard {
    org_name: string;
    group_name: string;
    channel: Channel;
    url: string;
    youtube_id: string;
    title: string;
    thumbnail: string;
    live: boolean;
    lastUpdated: DateTime;
    start_date: DateTime;
    end_date: DateTime;
}

