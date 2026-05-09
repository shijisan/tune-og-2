import { Innertube, UniversalCache } from 'youtubei.js';
import { getInnertube } from '../utils/innertube';
// import fs from "fs";

interface MusicSearchResult {
    id: string;
    title: string;
    views?: string;
    artists?: Array<{ name?: string }>;
    author?: { name?: string };
}

export class Youtube {
    private readonly DEFAULT_CONFIG = {
        user_agent: "Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        client_type: "ANDROID" as const,
        cache: new UniversalCache(false),
    };

    // for debugging output of firstResult
    // logToFile(data: any) {
    //     fs.appendFileSync(
    //         "logs.txt",
    //         `[${new Date().toISOString()}] ${JSON.stringify(data, null, 2)}\n\n`
    //     );
    // }

    private innertube: Promise<Innertube>;

    constructor() {
        this.innertube = getInnertube(this.DEFAULT_CONFIG);
    }

    async search(query: string) {
        const innertube = await this.innertube;

        const [songSearch, videoSearch] = await Promise.all([
            innertube.music.search(query, { type: 'song', sort_by: "relevance"}),
            innertube.music.search(query, { type: 'video', sort_by: "relevance" }),
        ]);

        const songResults = (songSearch.songs?.contents || []) as MusicSearchResult[];
        const videoResults = (videoSearch.videos?.contents || []) as MusicSearchResult[];

        const topResults = [...songResults, ...videoResults].slice(0, 10);

        const metadataList = await Promise.all(
            topResults.map(result => this._getMetadata(result.id))
        );

        return metadataList
    }

    async _getMetadata(videoId: string) {
        const innertube = await this.innertube;

        const info = await innertube.music.getInfo(videoId);

        // dont need to get the stream url as ytdlp worker does that
        // const formats = [
        //     ...(info.streaming_data?.formats ?? []),
        //     ...(info.streaming_data?.adaptive_formats ?? []),
        // ];

        // const bestAudio = formats
        //     .filter((f: any) => f.mime_type?.includes('audio'))
        //     .sort((a: any, b: any) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
        // const finalUrl = bestAudio?.url ?? await bestAudio?.decipher(innertube.session.player) ?? null;


        return {
            id: info.basic_info?.id,
            title: info.basic_info?.title,
            artist: info.basic_info?.author,
            duration: info.basic_info?.duration,
            thumbnail: (info.basic_info?.thumbnail as any)?.[0]?.url ?? null,
            finalUrl: `https://youtube.com/watch?v=${info.basic_info.id}`,
        };
    }

}