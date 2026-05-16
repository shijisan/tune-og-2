import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useCallback, useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/playerStore";

export function useStreamMusic() {
  // ✅ Call hooks unconditionally at top level
  const player = useAudioPlayer({ uri: "" });
  const status = useAudioPlayerStatus(player);
  const { currentTrack } = usePlayerStore();
  
  const pendingPlay = useRef(false);
  const lastStreamUrl = useRef<string | null>(null);
  const playerRef = useRef(player);
  
  // Keep ref synced for imperative calls
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
  }, []);

  // Play when loaded after replace()
useEffect(() => {
  if (!status.isLoaded) return;
  if (!status.playing) return;

  player.setActiveForLockScreen(true, {
    title: currentTrack?.title,
    artist: currentTrack?.artist,
    artworkUrl: currentTrack?.thumbnail,
  });
}, [
  status.isLoaded,
  status.playing,
  currentTrack
]);

  // Handle track changes
  useEffect(() => {
    if (!currentTrack?.finalUrl) return;

    const workerUrl = process.env.EXPO_PUBLIC_WORKER_URL;
    if (!workerUrl) return;

    const streamUrl = `${workerUrl}/stream?url=${encodeURIComponent(currentTrack.finalUrl)}`;

    // Same track: just restart
    if (lastStreamUrl.current === streamUrl) {
      player.seekTo(0);
      player.play();
      return;
    }

    // New track: load and play when ready
    lastStreamUrl.current = streamUrl;
    pendingPlay.current = true;
    player.replace({ uri: streamUrl });

    // Fallback timeout if isLoaded doesn't fire
    const timeout = setTimeout(() => {
      if (pendingPlay.current) {
        pendingPlay.current = false;
        playerRef.current?.play();
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [currentTrack?.finalUrl, player]);

  const handlePlayStream = useCallback((sourceUrl: string) => {
    const workerUrl = process.env.EXPO_PUBLIC_WORKER_URL;
    if (!workerUrl) return;

    const streamUrl = `${workerUrl}/stream?url=${encodeURIComponent(sourceUrl)}`;

    if (lastStreamUrl.current === streamUrl) {
      playerRef.current?.seekTo(0);
      playerRef.current?.play();
      return;
    }

    lastStreamUrl.current = streamUrl;
    pendingPlay.current = true;
    playerRef.current?.replace({ uri: streamUrl });
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (status.didJustFinish) {
      playerRef.current?.seekTo(0);
      playerRef.current?.play();
    } else if (status.playing) {
      playerRef.current?.pause();
    } else {
      playerRef.current?.play();
    }
  }, [status.playing, status.didJustFinish]);

  const getProgress = useCallback(() => ({
    currTime: status.currentTime ?? 0,
    duration: status.duration ?? 0,
  }), [status.currentTime, status.duration]);

  return { handlePlayStream, status, handleTogglePlay, getProgress };
}