import { SQLiteDatabase } from 'expo-sqlite';
import { send } from './youtube.bridge';

interface MusicSearchResult {
    id: string;
    title: string;
    views?: string;
    artists?: Array<{ name?: string }>;
    author?: { name?: string };
}

// TODO: if webview is able to handle decipher, move entire youtube/innertube player class there instead
export class Youtube {

    async search(query: string, hasQueue: boolean = false, db: SQLiteDatabase) {
        const { songResults, videoResults } = await send("SEARCH", { query });

        const songItems =
            songResults?.contents?.flatMap((shelf: any) => shelf.contents ?? []) ?? [];

        const videoItems =
            videoResults?.contents?.flatMap((shelf: any) => shelf.contents ?? []) ?? [];

        const topResults = [...songItems, ...videoItems].slice(0, 6);

        console.log("top results", topResults || []);

        const metadataList = await Promise.all(
            topResults.map((result) => {
                if (!result.id) return null;
                return this._getMetadata(result.id, hasQueue);
            })
        ).then(res => res.filter(Boolean));

        return metadataList
    }

    async _getMetadata(videoId: string, hasQueue = false) {
        const data = await send("GET-METADATA", {
            videoId,
            hasQueue,
        });

        return {
            id: data.id,
            title: data.title,
            artist: data.artist,
            duration: data.duration,
            thumbnail: data.thumbnail,
            finalUrl: data.streamUrl,
            upComing: data.upNext,
        };
    }

}