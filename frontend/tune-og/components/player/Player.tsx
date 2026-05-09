import { Pressable, View, Dimensions } from "react-native"
import { Image } from "expo-image"
import { Text } from "../ui/text"
import { ControlButton, ControlType } from "./ControlButton"
import { Minus } from "lucide-react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
  useAnimatedReaction,
} from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useState } from "react"
import { runOnJS } from "react-native-worklets"
import { cssInterop, useColorScheme } from "nativewind"
import { Icon } from "../ui/icon"

cssInterop(Image, { className: "style" })

const { height } = Dimensions.get("window")

const SNAP_TOP = 0;
const SNAP_BOTTOM = height * 0.715;


export default function Player() {
  const { colorScheme } = useColorScheme();

  // Start collapsed
  const translateY = useSharedValue(SNAP_BOTTOM)
  const offset = useSharedValue(SNAP_BOTTOM)

  const gesture = Gesture.Pan()
    .onBegin(() => {
      offset.value = translateY.value
    })
    .onUpdate((e) => {
      translateY.value = Math.max(SNAP_TOP, Math.min(SNAP_BOTTOM, offset.value + e.translationY))
    })
    .onEnd((e) => {
      const draggedFarEnough = translateY.value > SNAP_BOTTOM * 0.15
      const flickedDown = e.velocityY > 500
      const flickedUp = e.velocityY < -500

      if (flickedUp || (!flickedDown && !draggedFarEnough)) {
        translateY.value = withSpring(SNAP_TOP, { damping: 50, stiffness: 300, mass: 1 })
      } else {
        translateY.value = withSpring(SNAP_BOTTOM, { damping: 50, stiffness: 300, mass: 1 })
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

   const progress = useDerivedValue(() =>
    interpolate(translateY.value, [SNAP_TOP, SNAP_BOTTOM], [0, 1])
  )

  // react states
  const [isCollapsed, setIsCollapsed] = useState(false)

  useAnimatedReaction(
  () => progress.value > 0.5,
  (isNowCollapsed) => runOnJS(setIsCollapsed)(isNowCollapsed)
)

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: height,         // full height so expanded state fills screen
            backgroundColor: "black",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderWidth: 1,
            borderColor: colorScheme === 'dark' ? "#FFFFFF80" : "#80000000",
          },
          animatedStyle,
        ]}
      >
        <View className="flex items-center justify-center w-full py-2">
          <Pressable>
            <Icon className="opacity-70" as={Minus} size={24} />
          </Pressable>
        </View>

        <View className="flex flex-col items-center justify-center px-6 w-full gap-4">
          <View className={`w-full items-center gap-4 ${isCollapsed ? "flex-row" : "flex-col"}`}>
            <Image
              source={{ uri: "https://placehold.co/500/webp"}}
              className={`rounded-xl aspect-square w-14 h-14 ${isCollapsed ? "w-14 h-14" : "w-72 h-72"}`}
            />
            <View>
              <Text className={isCollapsed ? "text-left" : "text-center"}>Title</Text>
              <Text className={isCollapsed ? "text-left" : "text-center"}>{`Artists' Name`}</Text>
            </View>
          </View>

          <View className="flex flex-col items-center justify-center w-full">
            <Pressable className="w-full bg-muted-foreground max-h-1.5 rounded-full">
              <View className="h-full min-w-0.5 bg-foreground rounded-full" />
            </Pressable>
            <View className="flex flex-row gap-6 mt-6">
              <ControlButton type={ControlType.Prev} />
              <ControlButton type={ControlType.Play} />
              <ControlButton type={ControlType.Next} />
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}