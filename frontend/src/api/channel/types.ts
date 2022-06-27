export interface ChannelJSON {
    channel: Channel[];
}

export interface Channel {
    channelName: string;
    youtubeID: string;
    youtube: string;
    twitter: string;
    avatar: string;
    lastUpdated: Date;
    groupName: string;
    streams: Stream[];
}

export interface Stream {
    url: string;
    youtubeID: string;
    title: string;
    thumbnail: string;
    live: boolean;
    lastUpdated: Date;
    startDate: Date;
    endDate: Date;
    channelName: string;
}
