import { Switch } from "@/components/ui/switch";
import { Server } from "lucide-react-native";
import { ReactNode } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import IconColorHelper from "@/utils/icon-color-helper";
import { useSettings } from "@/hooks/use-settings";

export default function Settings() {

    // HOOKS
    const iconColor = IconColorHelper();
    const {settings, update, refetch} = useSettings();

    // RESOLVERS
    const resolveSourceSetting = settings?.audio_source === "local" ? false : true;

    // TYPES (move in the future to dedicated folder)
    type SettingItemData = {
        icon: ReactNode | null;
        title: string;
        description: string;
        children: ReactNode | null;
    }

    // OBJECTS
    const settingItemData: SettingItemData[] = [
        {
            icon: <Server color={iconColor} />,
            title: "Source Control",
            description: "Switch to server instead of local source.",
            children: <Switch checked={resolveSourceSetting} onCheckedChange={() => update("audio_source")} />,
        },
        // add more if necessary
    ]

    const SettingItem = ({ icon, title, description, children }: SettingItemData) => (
        <View className="flex flex-row gap-3 items-center">
            <View className="text-muted-foreground">
                {icon}
            </View>
            <View className="flex flex-col items-start gap-1 text-left flex-1">
                <Text className="text-left text-sm text-foreground">{title}</Text>
                <Text className="text-left text-xs text-muted-foreground">{description}</Text>
            </View>
            <View>
                {children}
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1">
            <FlatList
                keyExtractor={(item) => item.title}
                data={settingItemData}
                renderItem={({ item }) =>
                    <SettingItem
                        icon={item.icon}
                        title={item.title}
                        description={item.description}
                        children={item.children}
                    />
                }
            />
        </SafeAreaView>
    )
}