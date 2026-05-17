import { Pressable, View, Dimensions } from "react-native"
import { Image } from "expo-image"
import { Text } from "../ui/text"
import { ControlButton, ControlType } from "./ControlButton"
import { LoaderCircle, Minus } from "lucide-react-native"
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	useDerivedValue,
	interpolate,
	useAnimatedReaction,
} from "react-native-reanimated"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useState, useMemo, useEffect } from "react"
import { scheduleOnRN } from "react-native-worklets"
import { cssInterop, useColorScheme } from "nativewind"
import { Icon } from "../ui/icon"
import { usePlayerStore } from "@/store/playerStore"
import { usePlayer } from "../../context/playerContext";

cssInterop(Image, { className: "style" })

const { height } = Dimensions.get("window")
const SNAP_TOP = 0;
const SNAP_BOTTOM = height * 0.715;

export default function Player() {
	const { handleTogglePlay, status, getProgress, handlePlayNext, handlePlayPrev } = usePlayer();
	const currentTrack = usePlayerStore((state) => state.currentTrack);

	const { currTime, duration } = useMemo(() => getProgress(), [status.currentTime, status.duration]);
	const trackProgress = duration > 0 ? currTime / duration : 0;

	const { colorScheme } = useColorScheme();

	const translateY = useSharedValue(SNAP_BOTTOM)
	const offset = useSharedValue(SNAP_BOTTOM)

	const gesture = Gesture.Pan()
		.onBegin(() => { offset.value = translateY.value })
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

	const [isCollapsed, setIsCollapsed] = useState(false)

	useAnimatedReaction(
		() => progress.value > 0.5,
		(isNowCollapsed) => scheduleOnRN(setIsCollapsed, isNowCollapsed)
	)

	const animatedProgress = useDerivedValue(() => trackProgress)
	const progressStyle = useAnimatedStyle(() => ({
		width: `${animatedProgress.value * 100}%`,
	}))

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);

		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const [displayedTrack, setDisplayedTrack] = useState(currentTrack);

	useEffect(() => {
		if (status.isLoaded) {
			setDisplayedTrack(currentTrack);
		}
	}, [status.isLoaded, currentTrack?.id]);

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View
				style={[
					{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						height: height,
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
					<Pressable onPress={() => translateY.value = withSpring(SNAP_BOTTOM)}>
						<Icon className="opacity-70" as={Minus} size={24} />
					</Pressable>
				</View>

				<View className={`flex flex-col ${isCollapsed ? "justify-start" : "justify-center"} items-center px-6 w-full gap-4 flex-1 min-2-0`}>
					<View className={`w-full items-center gap-4 ${isCollapsed ? "flex-row" : "flex-col"}`}>
						<View className="relative">
							<Image
								source={{ uri: displayedTrack?.thumbnail ?? "https://placehold.co/500/webp" }}
								className={`rounded-xl aspect-square ${isCollapsed ? "w-14 h-14" : "w-72 h-72"}`}
							/>
							{
								status.isBuffering && !status.isLoaded && (
									<View className="bg-background/10 absolute w-full h-full top-0 left-0 flex justify-center items-center">
										<View className="animate-spin size-fit">
											<LoaderCircle size={24} color={colorScheme === "dark" ? "#ffffff" : "#000000"} />
										</View>
									</View>
								)
							}
						</View>
						<View>
							<Text className={isCollapsed ? "text-left" : "text-center"} numberOfLines={1}>
								{displayedTrack?.title ?? "No track playing"}
							</Text>
							<Text className={isCollapsed ? "text-left" : "text-center"} numberOfLines={1}>
								{displayedTrack?.artist ?? "Unknown Artist"}
							</Text>
						</View>
					</View>

					<View className="flex flex-col items-center justify-center w-full">
						<View className="flex flex-col w-full gap-1">
							<Pressable className="w-full bg-muted-foreground max-h-1.5 rounded-full">
								<Animated.View className="h-full min-w-0.5 bg-foreground rounded-full" style={progressStyle} />
							</Pressable>
							<View className="flex flex-row justify-between w-full">
								<Text className="text-xs text-muted-foreground">
									{formatTime(currTime ?? 0)}
								</Text>

								<Text className="text-xs text-muted-foreground">
									{formatTime(displayedTrack?.duration ?? 0)}
								</Text>
							</View>
						</View>

						{/* todo: disable interaction on loading */}
						<View className="flex flex-row gap-6 mt-3">
							<ControlButton type={ControlType.Prev}  props={{onPress: handlePlayPrev}} />
							<ControlButton
								type={status.playing ? ControlType.Pause : ControlType.Play}
								props={{ onPress: handleTogglePlay }}
							/>
							<ControlButton type={ControlType.Next} props={{onPress: handlePlayNext}} />
						</View>
					</View>
				</View>
			</Animated.View>
		</GestureDetector>
	)
}