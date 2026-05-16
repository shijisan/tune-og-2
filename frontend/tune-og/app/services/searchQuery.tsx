// todo: use tanstack query

export default async function fetchSearchResults(searchTerm: string) {

    const params = new URLSearchParams({ q: searchTerm });

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