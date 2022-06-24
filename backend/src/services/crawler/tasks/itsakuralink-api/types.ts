export interface ResponseData {
    status: string;
    data: Data;
}

export interface Data {
    events: Event[];
}

export interface Event {
    id: number;
    name: string;
    description: string;
    public: number;
    url: string;
    thumbnail: string;
    startDate: Date;
    endDate: Date;
    recommend: boolean;
    genre: Genre | null;
    livers: Liver[];
}

export interface Genre {
    id: number;
    name: string;
}

export interface Liver {
    id: number;
    name: string;
    avatar: string;
    color: string;
}
