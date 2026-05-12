import { Pressable, TextInput, View } from "react-native";
import { fetchSearchResults } from "@/app/services/searchQuery";
import { useState } from "react";
import { router } from "expo-router";

export default function Search() {

    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);

    async function handleSearch(searchTerm: string) {
        const searchResponse = await fetchSearchResults(searchTerm);
        setResults(searchResponse);
    }

    // todo: make hook for handling streaming

    return(
        <>
        <View>
            <TextInput placeholder="Search songs..." value={searchTerm} onChangeText={setSearchTerm} />
            <View>
                {/* todo: results, complete the expo audio util: useStreamMusic */}
                {results.map((result) => 
                    <Pressable onPress={() => {}}>

                    </Pressable>
                )}
            </View>
        </View>
        </>
    )
}