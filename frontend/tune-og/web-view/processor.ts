import { decipher } from "./decipher";
import { search } from "./search";
import { getPlayer } from "./singleton";

export async function processMessage(type: string, payload: any) {
    switch (type) {

        case "DECIPHER":
            return decipher(payload.video_url);

        case "GET-METADATA": {
            const yt = await getPlayer();

            const info = await yt.music.getInfo(payload.videoId);

            const format = info.chooseFormat({
                type: "audio",
                quality: "best",
            });

            const upNextRaw = payload.hasQueue
                ? await info.getUpNext()
                : null;

            const cipher = format.signature_cipher;

            if (!cipher) {
                throw new Error("No signature cipher found");
            }

            const streamUrl = await format.decipher(yt.session.player);

            return {
                id: info.basic_info?.id,
                title: info.basic_info?.title,
                artist: info.basic_info?.author,
                duration: info.basic_info?.duration,
                thumbnail: info.basic_info?.thumbnail?.[0]?.url ?? null,

                streamUrl,

                upNext: upNextRaw
                    ? upNextRaw.contents.map((v: any) => ({
                        id: v.video_id,
                        title: v.title?.text ?? v.title,
                        author: v.author?.name,
                    }))
                    : [],
            };
        }

        case "SEARCH":
            console.log("Bridge: Received SEARCH command for query:", payload.query);
            try {
                const results = await search(payload.query);
                console.log("Bridge: SEARCH completed successfully");
                return results;
            } catch (searchError: any) {
                console.error("CRITICAL SEARCH ERROR DETECTED:", searchError);
                return { error: searchError.message, stack: searchError.stack };
            }

        default:
            throw new Error(`Unknown command: ${type}`);
    }
}