import Search from "@/components/searchbar/Search";
import { Music } from "lucide-react-native";
import { Linking, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

export default function HomeScreen() {

  const { colorScheme } = useColorScheme();

  return (
    <View>
      {/* todo: search component */}
      <Search />

      <View className=" justify-center flex px-5">
        <View className="flex flex-row gap-2 items-center">
          <Music size={24} color={colorScheme === "dark" ? "#ffffff" : "#000000"} />

          <Text className="text-white text-3xl">
            Tune-OG
          </Text>
        </View>
        <Text className="text-white">
          Star it on github @ <Text className="text-blue-400" onPress={() => Linking.openURL('https://github.com/shijisan/tune-og-2')}>https://github.com/shijisan/tune-og-2</Text>
        </Text>
      </View>
    </View>
  );
}
