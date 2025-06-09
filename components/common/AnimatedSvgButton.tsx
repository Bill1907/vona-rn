import { useTheme } from "@/contexts/ThemeContext";
import React, { useEffect } from "react";
import { TouchableOpacity, ViewStyle } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { SvgIcons } from "./svg";

// SVG 아이콘 타입 정의
export type SvgIconType =
  | "play"
  | "pause"
  | "stop"
  | "mic"
  | "heart"
  | "star"
  | "plus"
  | "check"
  | "close"
  | "arrow-up"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "loading"
  | "pulse"
  | "logo";

// 애니메이션 타입 정의
export type AnimationType =
  | "none"
  | "scale"
  | "rotate"
  | "pulse"
  | "bounce"
  | "shake"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right";

interface AnimatedSvgButtonProps {
  icon: SvgIconType;
  size?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  animation?: AnimationType;
  animationDuration?: number;
  animationRepeat?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  // 커스텀 SVG 경로를 위한 옵션
  customSvgPath?: string;
  customViewBox?: string;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export const AnimatedSvgButton: React.FC<AnimatedSvgButtonProps> = ({
  icon,
  size = 48,
  color,
  backgroundColor = "transparent",
  borderColor,
  borderWidth = 0,
  animation = "scale",
  animationDuration = 300,
  animationRepeat = false,
  disabled = false,
  onPress,
  onLongPress,
  style,
  containerStyle,
  customSvgPath,
  customViewBox = "0 0 24 24",
}) => {
  const { colorScheme } = useTheme();

  // 기본 색상 설정
  const defaultColor =
    color || (colorScheme === "dark" ? "#ffffff" : "#000000");

  // 애니메이션 값들
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // SVG 아이콘 렌더링
  const renderSvgIcon = () => {
    const IconComponent = SvgIcons[icon];

    if (customSvgPath) {
      return (
        <Svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox={customViewBox}
          style={style}
        >
          <Path d={customSvgPath} fill={defaultColor} />
        </Svg>
      );
    }

    if (IconComponent) {
      return (
        <IconComponent size={size * 0.6} color={defaultColor} strokeWidth={2} />
      );
    }

    // 기본값 (원형)
    return (
      <Svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        style={style}
      >
        <Circle
          cx="12"
          cy="12"
          r="10"
          stroke={defaultColor}
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    );
  };

  // 애니메이션 시작
  const startAnimation = () => {
    switch (animation) {
      case "scale":
        scale.value = withSpring(
          0.9,
          { duration: animationDuration / 2 },
          () => {
            scale.value = withSpring(1, { duration: animationDuration / 2 });
          }
        );
        break;

      case "rotate":
        rotation.value = withTiming(
          360,
          { duration: animationDuration },
          () => {
            rotation.value = 0;
            if (animationRepeat) {
              runOnJS(startAnimation)();
            }
          }
        );
        break;

      case "pulse":
        scale.value = withRepeat(
          withTiming(1.1, { duration: animationDuration / 2 }),
          animationRepeat ? -1 : 2,
          true
        );
        break;

      case "bounce":
        translateY.value = withRepeat(
          withTiming(-10, { duration: animationDuration / 2 }),
          animationRepeat ? -1 : 2,
          true
        );
        break;

      case "shake":
        translateX.value = withRepeat(
          withTiming(5, { duration: animationDuration / 8 }),
          animationRepeat ? -1 : 8,
          true
        );
        break;

      case "fade":
        opacity.value = withTiming(
          0.3,
          { duration: animationDuration / 2 },
          () => {
            opacity.value = withTiming(1, { duration: animationDuration / 2 });
          }
        );
        break;

      case "slide-up":
        translateY.value = withTiming(
          -20,
          { duration: animationDuration / 2 },
          () => {
            translateY.value = withTiming(0, {
              duration: animationDuration / 2,
            });
          }
        );
        break;

      case "slide-down":
        translateY.value = withTiming(
          20,
          { duration: animationDuration / 2 },
          () => {
            translateY.value = withTiming(0, {
              duration: animationDuration / 2,
            });
          }
        );
        break;

      case "slide-left":
        translateX.value = withTiming(
          -20,
          { duration: animationDuration / 2 },
          () => {
            translateX.value = withTiming(0, {
              duration: animationDuration / 2,
            });
          }
        );
        break;

      case "slide-right":
        translateX.value = withTiming(
          20,
          { duration: animationDuration / 2 },
          () => {
            translateX.value = withTiming(0, {
              duration: animationDuration / 2,
            });
          }
        );
        break;
    }
  };

  // 자동 애니메이션 시작 (loading, pulse 등)
  useEffect(() => {
    if ((icon === "loading" || animationRepeat) && animation !== "none") {
      startAnimation();
    }
  }, [icon, animation, animationRepeat]);

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    if (!disabled && animation !== "none" && !animationRepeat) {
      startAnimation();
    }
    onPress?.();
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        {
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor,
          borderRadius: size / 2,
          borderWidth,
          borderColor,
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
        containerStyle,
      ]}
      onPress={handlePress}
      onLongPress={onLongPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {renderSvgIcon()}
    </AnimatedTouchableOpacity>
  );
};
