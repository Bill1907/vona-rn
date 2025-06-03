import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

interface HamburgerMenuProps {
  onPress: () => void;
  size?: number;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  onPress,
  size = 24,
}) => {
  const { colorScheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 8,
        marginLeft: 8,
      }}
    >
      <Ionicons
        name="menu"
        size={size}
        color={colorScheme === "dark" ? "#ffffff" : "#1f2937"}
      />
    </TouchableOpacity>
  );
};
