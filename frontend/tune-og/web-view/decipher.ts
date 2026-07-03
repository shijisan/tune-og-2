import { getPlayer } from "./singleton";

export async function decipher(arg: any) {
  const yt = await getPlayer();
  return yt.session.player?.decipher(arg);
}