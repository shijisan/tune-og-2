export async function FetchAudioStream(sourceUrl: string) {
    const encodedUrl = encodeURIComponent(sourceUrl);
    try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/stream/${encodedUrl}`);

        if (!res.ok) {
            console.error("Failed to stream audio", res);
        }

        const data = await res.json();
        
        return data;

    } catch (err) {
        console.log("Server error:", err);
    }
}