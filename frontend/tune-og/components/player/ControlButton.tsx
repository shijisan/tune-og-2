import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react-native"
import { Button } from "../ui/button"
import { Icon } from "../ui/icon"

export enum ControlType {
  Prev,
  Play,
  Pause,
  Next,
}

export function ControlButton({ type }: { type: ControlType }) {
  const getIcon = () => {
    switch (type) {
      case ControlType.Prev:
        return SkipBack
      case ControlType.Play:
        return Play
      case ControlType.Pause:
        return Pause
      case ControlType.Next:
        return SkipForward
    }
  }

  const IconComponent = getIcon()

  return (
    <Button variant="outline" size="icon">
      <Icon as={IconComponent} />
    </Button>
  )
}