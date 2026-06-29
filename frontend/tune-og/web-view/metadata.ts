import { getPlayer } from "./singleton";

// this only runs when local
export async function getInfo(videoId: string, hasQueue: boolean = false) {
    const yt = await getPlayer();
    return await yt.music.getInfo(videoId);
}