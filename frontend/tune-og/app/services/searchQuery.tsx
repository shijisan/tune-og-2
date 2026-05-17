// todo: use tanstack query

// if playerStore.state.upComing.length === 0, set 2nd parameter of fetchSearchResults (hasQueue) to true

export default async function fetchSearchResults(searchTerm: string, hasQueue: boolean = false) {

    const params = new URLSearchParams({ query: searchTerm, hasQueue: String(hasQueue) });

    try {
        const res = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/search?${params.toString()}`
        );

        if (!res.ok) {
            console.log("Failed to fetch songs:", res);
        }

        const data = await res.json();

        return data;

    } catch (err) {
        console.log("Server error:", err);
    }

}