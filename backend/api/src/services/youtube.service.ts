import { Innertube, UniversalCache } from 'youtubei.js';
import { getInnertube } from '../utils/innertube';

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

    private innertube: Promise<Innertube>;

    constructor() {
        this.innertube = getInnertube(this.DEFAULT_CONFIG);
    }

    async search(query: string, hasQueue: boolean = false) {
        const innertube = await this.innertube;

        const [songSearch, videoSearch] = await Promise.all([
            innertube.music.search(query, { type: 'song', sort_by: "relevance"}),
            innertube.music.search(query, { type: 'video', sort_by: "relevance" }),
        ]);

        const songResults = (songSearch.songs?.contents || []) as MusicSearchResult[];
        const videoResults = (videoSearch.videos?.contents || []) as MusicSearchResult[];

        const topResults = [...songResults, ...videoResults].slice(0, 10);

        const metadataList = await Promise.all(
            topResults.map(result => this._getMetadata(result.id, hasQueue))
        );

        return metadataList
    }

    async _getMetadata(videoId: string, hasQueue: boolean = false) {
        const innertube = await this.innertube;

        const info = await innertube.music.getInfo(videoId);

        const upComingList = hasQueue ? (await info.getUpNext()).contents : []; // todo: improve performance of this, adds around 3 secs per req (only an issue on initial track select)

        return {
            id: info.basic_info?.id,
            title: info.basic_info?.title,
            artist: info.basic_info?.author,
            duration: info.basic_info?.duration,
            thumbnail: (info.basic_info?.thumbnail as any)?.[0]?.url ?? null,
            finalUrl: `https://youtube.com/watch?v=${info.basic_info.id}`,
            upComing: upComingList,
        };
    }

}