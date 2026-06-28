import { SQLiteDatabase } from "expo-sqlite";

export type Settings = {
    id: number;
    audio_source: "local"| "server";
}

export async function fetchSettings(db: SQLiteDatabase) {

    return await db.getFirstAsync<Settings>(
        "SELECT * FROM settings WHERE id = 1"
    );
}

export async function toggleAudioSource(db: SQLiteDatabase) {

    const settings = await fetchSettings(db);

    if (!settings) throw new Error("Settings not initialized");

    const nextSource = settings.audio_source === "local" ? "server" : "local";

    await db.runAsync(
        `
        UPDATE settings
        SET
            audio_source = ?
        WHERE id = 1
        `,
        [nextSource]
    );
}
