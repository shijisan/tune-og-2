import { create } from "zustand";

interface PlayerMetadata {
  id: string;
  title: string;
  artist: any;
  thumbnail?: string;
  currTime: number;
  duration: number;
  finalUrl: string;
};

interface PlayerStore {
  currentTrack: PlayerMetadata | null;
  setCurrentTrack: (track: PlayerMetadata) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  setCurrentTrack: (track) => set({ currentTrack: track }),
}));