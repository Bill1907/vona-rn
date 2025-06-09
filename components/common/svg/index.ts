// Types
export type { SvgIconComponent, SvgIconProps } from "./types";

// Icons
export { ArrowDownIcon } from "./ArrowDownIcon";
export { ArrowLeftIcon } from "./ArrowLeftIcon";
export { ArrowRightIcon } from "./ArrowRightIcon";
export { ArrowUpIcon } from "./ArrowUpIcon";
export { CheckIcon } from "./CheckIcon";
export { CloseIcon } from "./CloseIcon";
export { HeartIcon } from "./HeartIcon";
export { LoadingIcon } from "./LoadingIcon";
export { LogoIcon } from "./LogoIcon";
export { MicIcon } from "./MicIcon";
export { PauseIcon } from "./PauseIcon";
export { PlayIcon } from "./PlayIcon";
export { PlusIcon } from "./PlusIcon";
export { PulseIcon } from "./PulseIcon";
export { StarIcon } from "./StarIcon";
export { StopIcon } from "./StopIcon";

// Icon map for easy access
import { ArrowDownIcon } from "./ArrowDownIcon";
import { ArrowLeftIcon } from "./ArrowLeftIcon";
import { ArrowRightIcon } from "./ArrowRightIcon";
import { ArrowUpIcon } from "./ArrowUpIcon";
import { CheckIcon } from "./CheckIcon";
import { CloseIcon } from "./CloseIcon";
import { HeartIcon } from "./HeartIcon";
import { LoadingIcon } from "./LoadingIcon";
import { LogoIcon } from "./LogoIcon";
import { MicIcon } from "./MicIcon";
import { PauseIcon } from "./PauseIcon";
import { PlayIcon } from "./PlayIcon";
import { PlusIcon } from "./PlusIcon";
import { PulseIcon } from "./PulseIcon";
import { StarIcon } from "./StarIcon";
import { StopIcon } from "./StopIcon";

export const SvgIcons = {
  play: PlayIcon,
  pause: PauseIcon,
  stop: StopIcon,
  mic: MicIcon,
  heart: HeartIcon,
  star: StarIcon,
  plus: PlusIcon,
  check: CheckIcon,
  close: CloseIcon,
  "arrow-up": ArrowUpIcon,
  "arrow-down": ArrowDownIcon,
  "arrow-left": ArrowLeftIcon,
  "arrow-right": ArrowRightIcon,
  loading: LoadingIcon,
  logo: LogoIcon,
  pulse: PulseIcon,
} as const;
