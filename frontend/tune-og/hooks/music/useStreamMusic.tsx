import {
	setAudioModeAsync,
	useAudioPlayer,
	useAudioPlayerStatus,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { useSettings } from "../use-settings";
import { Settings } from "@/database/repository/settings";

export function useStreamMusic() {

	// HOOKS
	const player = useAudioPlayer({ uri: "" });
	const status = useAudioPlayerStatus(player);
	const { currentTrack, setCurrentTrack } = usePlayerStore();
	const { settings } = useSettings();


	// VARS
	const lastTrackRef = useRef<string | null>(null);
	const playerRef = useRef(player);
	const pendingTrackRef = useRef<string | null>(null);
	const isAdvancingRef = useRef(false);
	const audioSource = settings?.audio_source;


	// MOUNTING
	// listen to player init to create copy of current instance
	useEffect(() => {
		playerRef.current = player;
	}, [player]);

	// allow play in bg on mount
	useEffect(() => {
		setAudioModeAsync({
			playsInSilentMode: true,
			shouldPlayInBackground: true,
			interruptionMode: "doNotMix",
		});
	}, []);

	// listen to track change
	useEffect(() => {
		if (!currentTrack?.finalUrl) return;
		handlePlayStream(currentTrack.finalUrl);
	}, [currentTrack?.finalUrl]);

	// listen to change track to set for lockscreen media controls
	useEffect(() => {
		if (!status.isLoaded) return;

		player.setActiveForLockScreen(true, {
			title: currentTrack?.title,
			artist: currentTrack?.artist,
			artworkUrl: currentTrack?.thumbnail,
		});
	}, [status.isLoaded, currentTrack]);

	useEffect(() => {
		if (!status.didJustFinish) return;
		if (!currentTrack?.upComing?.length) return;
		if (isAdvancingRef.current) return;

		const queue = currentTrack.upComing.filter(
			(item) => item.video_id !== currentTrack.id
		);

		if (!queue.length) return;

		isAdvancingRef.current = true;
		setTimeout(() => { isAdvancingRef.current = false; }, 500);

		const [next, ...rest] = queue;

		const nextUrl = `https://youtube.com/watch?v=${next.video_id}`;
		pendingTrackRef.current = nextUrl;

		setCurrentTrack({
			id: next.video_id,
			title: next.title.text,
			artist: next.artists?.map((a: { name: string }) => a.name).join(', ') ?? next.author,
			thumbnail: next.thumbnail?.[0]?.url,
			duration: next.duration.seconds ?? 0,
			currTime: 0,
			finalUrl: nextUrl,
			upComing: rest,
		});
	}, [status.didJustFinish, setCurrentTrack, currentTrack]);


	const handlePlayStream = useCallback(async (sourceUrl: string) => {
		let audioUrl = sourceUrl;
		const isSameTrack = lastTrackRef.current === sourceUrl;
		
		if (audioSource === "local") {
			playerRef.current?.replace({ uri: audioUrl });
			playerRef.current?.play();
			
		} else {
			const workerUrl = process.env.EXPO_PUBLIC_WORKER_URL;
			if (!workerUrl) return;
			// console.log('handlePlayStream called:', sourceUrl, 'lastTrack:', lastTrackRef.current);

			if (isSameTrack) {
				// console.log('blocked, same track');
				return;
			}

			lastTrackRef.current = sourceUrl;
			pendingTrackRef.current = null;

			const streamEndpoint = `${workerUrl}/stream?url=${encodeURIComponent(sourceUrl)}`;

			try {
				const res = await fetch(streamEndpoint);
				const streamJson = await res.json();
				if (!res.ok || streamJson.error) throw new Error(streamJson.error ?? "Failed to start stream job");

				audioUrl = `${workerUrl}${streamJson.url}`;
			} catch (err) {
				throw err;
			}
		}

		try {
			playerRef.current?.replace({ uri: audioUrl });
			playerRef.current?.play();
		} catch (err) {
			console.error("stream error:", err);
			lastTrackRef.current = null;
		}
	}, []);


	const handleSmartPlay = useCallback(
		(sourceUrl: string) => {
			const isSameTrack = lastTrackRef.current === sourceUrl && pendingTrackRef.current === null;

			if (!status.isLoaded || !isSameTrack) {
				handlePlayStream(sourceUrl);
				return;
			}

			if (status.playing) {
				playerRef.current?.pause();
			} else {
				playerRef.current?.play();
			}
		},
		[status.isLoaded, status.playing]
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

	const handlePlayNext = useCallback(() => {
		playerRef.current.pause();
		if (!currentTrack?.upComing?.length) return;
		if (isAdvancingRef.current) return;
		isAdvancingRef.current = true;
		setTimeout(() => { isAdvancingRef.current = false; }, 500);

		// skip the first item if it's the same as the current track
		const queue = currentTrack.upComing.filter(
			(item) => item.video_id !== currentTrack.id
		);

		if (!queue.length) return;
		const [next, ...rest] = queue;

		const nextUrl = `https://youtube.com/watch?v=${next.video_id}`;
		pendingTrackRef.current = nextUrl;

		setCurrentTrack({
			id: next.video_id,
			title: next.title.text,
			artist: next.artists?.map((a: { name: string }) => a.name).join(', ') ?? next.author,
			thumbnail: next.thumbnail?.[0]?.url,
			duration: next.duration.seconds ?? 0,
			currTime: 0,
			finalUrl: nextUrl,
			upComing: rest,
		});
	}, [currentTrack, setCurrentTrack]);

	const handlePlayPrev = useCallback(() => {
		// todo: make track history to support prev track
		playerRef.current?.seekTo(0);
		return;
	}, [status.currentTime]);


	return {
		handlePlayStream: handleSmartPlay,
		handleTogglePlay,
		handlePlayNext,
		handlePlayPrev,
		getProgress,
		status,
	};
}