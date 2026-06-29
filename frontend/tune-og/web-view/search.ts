import { getPlayer } from "./singleton";

export async function search(query: string) {
  console.log("getting player in search");
  const yt = await getPlayer();

  console.log("getting search results for type song and video");
  const [songResults, videoResults] = await Promise.all([
    yt.music.search(query, { type: "song" }),
    yt.music.search(query, { type: "video" }),
  ]);
  console.log("returning search results");

  return { songResults, videoResults };
}