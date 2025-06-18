import { useTheme } from "@/contexts/ThemeContext";
import { BlurView } from "@react-native-community/blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  includeSafeArea?: boolean;
  variant?: "default" | "secondary" | "tertiary" | "gradient" | "animated";
  isActive?: boolean;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({
  children,
  style,
  includeSafeArea = true,
  variant = "default",
  isActive = false,
}) => {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();

  // 애니메이션 값들
  const scaleAnimation = useSharedValue(1);
  const slideAnimation = useSharedValue(0);

  useEffect(() => {
    // 스케일 애니메이션 (1초 주기)
    scaleAnimation.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1,
      true
    );

    // 슬라이드 애니메이션 (10초 주기)
    slideAnimation.value = withRepeat(
      withTiming(1, { duration: 10000 }),
      -1,
      true
    );
  }, []);

  const getBackgroundColor = () => {
    switch (variant) {
      case "secondary":
        return colorScheme === "dark" ? "#111827" : "#f9fafb";
      case "tertiary":
        return colorScheme === "dark" ? "#0f172a" : "#f1f5f9";
      default:
        return colorScheme === "dark" ? "#000000" : "#ffffff";
    }
  };

  const containerStyle = {
    flex: 1,
    paddingTop: includeSafeArea ? insets.top : 0,
  };

  // 애니메이션 스타일들
  const animatedCircle1Style = useAnimatedStyle(() => {
    const scale = isActive ? scaleAnimation.value : 1;
    const slideOffset = interpolate(slideAnimation.value, [0, 1], [-20, 20]);

    return {
      transform: [{ scale }, { translateX: slideOffset }],
    };
  });

  const animatedCircle2Style = useAnimatedStyle(() => {
    const scale = isActive ? scaleAnimation.value : 1;
    const slideOffset = interpolate(slideAnimation.value, [0, 1], [-20, 20]);

    return {
      transform: [{ scale }, { translateX: slideOffset }],
    };
  });

  const animatedCircle3Style = useAnimatedStyle(() => {
    const scale = isActive ? scaleAnimation.value : 1;
    const slideOffset = interpolate(slideAnimation.value, [0, 1], [20, -20]);

    return {
      transform: [{ scale }, { translateX: slideOffset }],
    };
  });

  // 그라데이션 variant인 경우 (기존)
  if (variant === "gradient") {
    return (
      <LinearGradient
        colors={[
          "#000000", // 검은색 (상단)
          "#1a1a2e", // 어두운 네이비
          "#16213e", // 진한 파란색
          "#0f3460", // 파란색
          "#0e4b99", // 더 밝은 파란색
          "#2a5298", // 보라빛 파란색
          "#004466", // 청록색
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[containerStyle, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  // 애니메이션 그라데이션 variant인 경우
  if (variant === "animated") {
    return (
      <View
        style={[
          containerStyle,
          { backgroundColor: getBackgroundColor() },
          style,
        ]}
      >
        {/* 배경 원들 */}
        <View
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* 첫 번째 원 (파란색) */}
          <Animated.View
            style={[
              {
                position: "absolute",
                left: -90,
                bottom: 0,
                width: 246,
                height: 246,
                borderRadius: 123,
                shadowColor: "#3A70EF",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 50,
                elevation: 10,
              },
              animatedCircle1Style,
            ]}
          >
            <LinearGradient
              colors={[
                colorScheme === "dark"
                  ? "rgba(58, 112, 239, 0.8)"
                  : "rgba(58, 112, 239, 0.4)",
                "rgba(58, 112, 239, 0)",
              ]}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 123,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* 두 번째 원 (보라색) */}
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 104,
                bottom: 124,
                width: 191,
                height: 191,
                borderRadius: 95.5,
                shadowColor: "#9C27B0",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 40,
                elevation: 8,
              },
              animatedCircle2Style,
            ]}
          >
            <LinearGradient
              colors={[
                colorScheme === "dark"
                  ? "rgba(156, 39, 176, 0.7)"
                  : "rgba(156, 39, 176, 0.35)",
                "rgba(156, 39, 176, 0)",
              ]}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 95.5,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* 세 번째 원 (청록색) */}
          <Animated.View
            style={[
              {
                position: "absolute",
                right: -78,
                bottom: 0,
                width: 283,
                height: 283,
                borderRadius: 141.5,
                shadowColor: "#00BCD4",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 60,
                elevation: 12,
              },
              animatedCircle3Style,
            ]}
          >
            <LinearGradient
              colors={[
                colorScheme === "dark"
                  ? "rgba(0, 188, 212, 0.8)"
                  : "rgba(0, 188, 212, 0.4)",
                "rgba(0, 188, 212, 0)",
              ]}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 141.5,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* 블러 오버레이 */}
          <BlurView
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            blurType={colorScheme === "dark" ? "dark" : "light"}
            blurAmount={10}
          >
            <View
              style={{
                flex: 1,
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(0, 0, 0, 0.1)"
                    : "rgba(255, 255, 255, 0.1)",
              }}
            />
          </BlurView>
        </View>

        {/* 컨텐츠 */}
        <View style={{ flex: 1, zIndex: 1 }}>{children}</View>
      </View>
    );
  }

  // 기본 배경
  return (
    <View
      style={[
        containerStyle,
        {
          backgroundColor: getBackgroundColor(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
