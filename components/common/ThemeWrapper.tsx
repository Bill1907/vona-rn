import { useTheme } from "@/contexts/ThemeContext";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { View } from "react-native";

interface ThemeWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({
  children,
  className,
  style,
}) => {
  const { colorScheme } = useTheme();
  const { setColorScheme } = useColorScheme();

  // Sync with NativeWind
  useEffect(() => {
    if (setColorScheme) {
      setColorScheme(colorScheme);
    }
  }, [colorScheme, setColorScheme]);

  return (
    <View className={className || ""} style={[{ flex: 1 }, style]}>
      {children}
    </View>
  );
};
