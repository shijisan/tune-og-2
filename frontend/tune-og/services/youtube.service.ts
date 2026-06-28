import { SQLiteDatabase } from 'expo-sqlite';
import { getInnertube } from '../utils/innertube';
import { fetchSettings } from '@/database/repository/settings';

interface MusicSearchResult {
    id: string;
    title: string;
    views?: string;
    artists?: Array<{ name?: string }>;
    author?: { name?: string };
}

// TODO: if webview is able to handle decipher, move entire youtube/innertube player class there instead
export class Youtube {

    private innertube: Promise<any>;

    constructor() {
        this.innertube = this.createInnerTube();
    }

    private async createInnerTube() {
        const { UniversalCache } = await import("youtubei.js");

        return getInnertube({
            user_agent:
                "Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            client_type: "ANDROID",
            cache: new UniversalCache(false), // issue: can't set value in `getInnerTube` function itself
        });
    }

    async search(query: string, hasQueue: boolean = false, db: SQLiteDatabase) {
        const innertube = await this.innertube;

        const [songSearch, videoSearch] = await Promise.all([
            innertube.music.search(query, { type: 'song' }),
            innertube.music.search(query, { type: 'video' }),
        ]);

        const songResults = (songSearch.songs?.contents || []) as MusicSearchResult[];
        const videoResults = (videoSearch.videos?.contents || []) as MusicSearchResult[];

        const topResults = [...songResults, ...videoResults].slice(0, 10);

        const metadataList = await Promise.all(
            topResults.map(result => this._getMetadata(result.id, hasQueue, db))
        );

        return metadataList
    }

    async _getMetadata(videoId: string, hasQueue: boolean = false, db: SQLiteDatabase) {
        const settings = await fetchSettings(db);
        const innertube = await this.innertube;

        const info = await innertube.music.getInfo(videoId);

        const upComingList = hasQueue ? (await info.getUpNext()).contents : []; // todo: improve performance of this, adds around 3 secs per req (only an issue on initial track select)

        const streamingObj = await info.chooseFormat({type: 'audio', quality: 'best'});
        const streamingUrl = streamingObj?.decipher(innertube.session.player); // TODO: move deciphering logic to webview (breaks because of react native browser <hermes>)
        const finalUrl = settings?.audio_source === "local" ? streamingUrl : `https://youtube.com/watch?v=${info.basic_info.id}`;
        

        return {
            id: info.basic_info?.id,
            title: info.basic_info?.title,
            artist: info.basic_info?.author,
            duration: info.basic_info?.duration,
            thumbnail: (info.basic_info?.thumbnail as any)?.[0]?.url ?? null,
            finalUrl,
            upComing: upComingList,
        };
    }

}