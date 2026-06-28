import { fetchSettings } from "@/database/repository/settings";
import { Youtube } from "./youtube.service";
import { SQLiteDatabase } from "expo-sqlite";

// todo: use tanstack query

// if playerStore.state.upComing.length === 0, set 2nd parameter of fetchSearchResults (hasQueue) to true

const youtube = new Youtube();

export default async function fetchSearchResults(db: SQLiteDatabase, searchTerm: string, hasQueue: boolean = false) {
    const settings = await fetchSettings(db);
    const audioSource = settings?.audio_source;

    const params = new URLSearchParams({ query: searchTerm, hasQueue: String(hasQueue) });

    try {

        const query = params.get("query") || "";
        const cleanedQuery = query.trim()

        if (!query || cleanedQuery === "") throw new Error("No query passed");

        let data;

        if (audioSource === "local") {
            const metadata = await youtube.search(cleanedQuery, hasQueue, db);
            data = metadata;
            // console.log("search data from metadata:", data);
            return data;

        } else {
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/search?${params.toString()}`
            );

            if (!res.ok) {
                console.log("Failed to fetch songs:", res);
            }

            data = await res.json();
            return data;
        }

    } catch (err) {
        console.log("Server error:", err);
        console.log(err instanceof Error ? err.stack : err);
    }

}