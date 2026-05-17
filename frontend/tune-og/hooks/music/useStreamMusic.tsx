import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useCallback, useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/playerStore";

export function useStreamMusic() {
  const player = useAudioPlayer({ uri: "" });
  const status = useAudioPlayerStatus(player);
  const { currentTrack } = usePlayerStore();

  const lastTrackRef = useRef<string | null>(null);
  const playerRef = useRef(player);

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

  useEffect(() => {
    if (!currentTrack?.finalUrl) return;
    handlePlayStream(currentTrack.finalUrl);
  }, [currentTrack?.finalUrl]);

  useEffect(() => {
    if (!status.isLoaded) return;

    player.setActiveForLockScreen(true, {
      title: currentTrack?.title,
      artist: currentTrack?.artist,
      artworkUrl: currentTrack?.thumbnail,
    });
  }, [status.isLoaded, currentTrack]);

  /**
   * STREAM START
   */
  const handlePlayStream = useCallback(async (sourceUrl: string) => {
    const workerUrl = process.env.EXPO_PUBLIC_WORKER_URL;
    if (!workerUrl) return;

    console.log("hit handplaystream");

    const streamEndpoint = `${workerUrl}/stream?url=${encodeURIComponent(sourceUrl)}`;

    if (lastTrackRef.current === sourceUrl) {
      playerRef.current?.seekTo(0);
      playerRef.current?.play();
      return;
    }

    lastTrackRef.current = sourceUrl;

    try {
      console.log("hitting:", streamEndpoint);

      const res = await fetch(streamEndpoint);
      const streamJson = await res.json();
      console.log("stream response:", JSON.stringify(streamJson));

      if (!res.ok || streamJson.error) throw new Error(streamJson.error ?? "Failed to start stream job");

      const audioUrl = `${workerUrl}${streamJson.url}`;
      console.log("loading audio from:", audioUrl);

      playerRef.current?.replace({ uri: audioUrl });
      playerRef.current?.play();
    } catch (err) {
      console.error("stream error:", err);
      lastTrackRef.current = null;
    }
  }, []);

  /**
   * SMART CONTROLLER (OPTION A)
   */
  const handleSmartPlay = useCallback(
    (sourceUrl: string) => {
      const isSameTrack = lastTrackRef.current === sourceUrl;

      if (!status.isLoaded || !isSameTrack) {
        handlePlayStream(sourceUrl);
        return;
      }

      // same track → just toggle
      if (status.didJustFinish) {
        playerRef.current?.seekTo(0);
        playerRef.current?.play();
        return;
      }

      if (status.playing) {
        playerRef.current?.pause();
      } else {
        playerRef.current?.play();
      }
    },
    [status.isLoaded, status.playing, status.didJustFinish]
  );

  const handleTogglePlay = useCallback(() => {
    if (!status.isLoaded || !lastTrackRef.current) return;

    if (status.didJustFinish) {
      playerRef.current?.seekTo(0);
      playerRef.current?.play();
      return;
    }

    if (status.playing) {
      playerRef.current?.pause();
    } else {
      playerRef.current?.play();
    }
  }, [status.isLoaded, status.playing, status.didJustFinish]);

  const getProgress = useCallback(
    () => ({
      currTime: status.currentTime ?? 0,
      duration: status.duration ?? 0,
    }),
    [status.currentTime, status.duration]
  );

  return {
    handlePlayStream: handleSmartPlay, // 👈 IMPORTANT: single entry point
    handleTogglePlay, // optional alias
    getProgress,
    status,
  };
}