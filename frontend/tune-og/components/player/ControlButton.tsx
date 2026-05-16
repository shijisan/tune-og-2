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

type ControlButtonProps = {
  type: ControlType;
  props?: any,
}

export function ControlButton({type, props} : ControlButtonProps) {
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
    <Button variant="outline" size="icon" {...props}>
      <Icon as={IconComponent} />
    </Button>
  )
}