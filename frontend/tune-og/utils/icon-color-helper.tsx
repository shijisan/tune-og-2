import { useColorScheme } from "nativewind";

export default function IconColorHelper() {
    const { colorScheme } = useColorScheme();

    const handleIconColor = colorScheme === 'dark' ? "#FAFAFA" : "#737373"

    return handleIconColor;
}