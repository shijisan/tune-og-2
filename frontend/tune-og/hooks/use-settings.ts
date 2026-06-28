import { fetchSettings, toggleAudioSource, type Settings } from "@/database/repository/settings"
import { useEffect, useState } from "react"
import { useSQLiteContext } from "expo-sqlite";

export function useSettings() {
    
    // VARS
    const [settings, setSettings] = useState<Settings | null>(null);
    
    // HOOKS
    const db = useSQLiteContext();

    // PUBLIC METHODS
    const refetch = async () => {
        const data = await fetchSettings(db);
        setSettings(data);
    };

    const update = async (targetTitle: string) => {
        switch (targetTitle) {
            case "audio_source":
                await toggleAudioSource(db);
                await refetch();
                break;
        }
    }

    // MOUNTING
    useEffect(() => {
        refetch();
    }, []);

    // RETURN
    return {settings, refetch, update};
}