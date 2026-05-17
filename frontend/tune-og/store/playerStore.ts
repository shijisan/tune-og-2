import { create } from "zustand";

interface PlayerMetadata {
  id: string;
  title: string;
  artist: any;
  thumbnail?: string;
  currTime: number;
  duration: number;
  finalUrl: string;
  upComing: any[];
};

interface PlayerStore {
  currentTrack: PlayerMetadata | null;
  setCurrentTrack: (track: PlayerMetadata) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  setCurrentTrack: (track) => set((state) => ({
    currentTrack: {
      ...track,
      upComing: track.upComing?.length ? track.upComing : state.currentTrack?.upComing ?? [],
    }
  })),
}));