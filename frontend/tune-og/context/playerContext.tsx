import { createContext, useContext, ReactNode } from "react";
import { useStreamMusic } from "@/hooks/music/useStreamMusic";

type PlayerContextType = ReturnType<typeof useStreamMusic>;

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const player = useStreamMusic();
  return (
    <PlayerContext.Provider value={player}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}