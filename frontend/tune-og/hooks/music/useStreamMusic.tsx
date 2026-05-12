import { useAudioPlayer } from 'expo-audio';
import { FetchAudioStream } from '@/app/services/audio/fetchAudioStream';

export async function useStreamMusic(sourceUrl: string) {
    const streamUrl = await FetchAudioStream(sourceUrl);
    const player = useAudioPlayer(streamUrl);
}