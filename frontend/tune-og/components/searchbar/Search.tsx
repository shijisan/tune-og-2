import { Image, Pressable, TextInput, View } from "react-native";
import fetchSearchResults from "../../app/services/searchQuery";
import { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../ui/text";
import { usePlayerStore } from "@/store/playerStore";
import { ScrollView } from "react-native-gesture-handler";


// todo: make explicit types/interfaces
type SearchResult = {
    id: string;
    title: string;
    artist?: any;
    thumbnail?: string;
    duration?: number;
    finalUrl: string;
    upComing: any[];
};

export default function Search() {

    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const setCurrentTrack = usePlayerStore((state) => state.setCurrentTrack);


    function handleSearch(searchInput: string) {
        setSearchTerm(searchInput);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
            const hasQueue = (usePlayerStore.getState().currentTrack?.upComing?.length ?? 0) > 0;
            const res = await fetchSearchResults(searchInput, hasQueue);
            setResults(res?.data?.metadata ?? []);
        }, 1000);
    }

    function handleSelectTrack(track: SearchResult) {
        setCurrentTrack({
            id: track.id,
            title: track.title,
            artist: track.artist ?? "Unknown",
            thumbnail: track.thumbnail ?? "",
            finalUrl: track.finalUrl,
            duration: track.duration ?? 0,
            currTime: 0,
            upComing: track.upComing,
        });
    }

    return (
        <SafeAreaView className="px-4">
            <TextInput
                className="rounded-full bg-muted text-foreground placeholder:text-foreground px-4"
                placeholder="Search songs..."
                value={searchTerm}
                onChangeText={handleSearch}
            />

            <ScrollView>
                {results?.map((result, index) => (
                    <Pressable
                        key={result.id ?? index}
                        className="flex flex-row gap-4 py-2 active:bg-muted"
                        onPress={() => {handleSelectTrack(result);}}
                    >
                        <Image source={{ uri: result.thumbnail }} height={70} width={70} />

                        <View className="flex-1">
                            <Text className="text-foreground" numberOfLines={1}>
                                {result.title}
                            </Text>

                            <Text className="text-muted-foreground" numberOfLines={1}>
                                {result.artist}
                            </Text>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </SafeAreaView>
    )
}