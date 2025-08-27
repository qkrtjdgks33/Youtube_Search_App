export interface YouTubeVideo {
    id: { videoId: string};
    snippet: {
        title: string;
        channelTitle: string;
        thumbnails: {
            medium?: { url: string };
            default?: { url: string };
        };
    };
};
