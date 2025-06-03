import { cn } from "@/lib/utils";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className,
}) => {
  const baseClasses = "rounded-lg items-center justify-center flex-row";

  const variantClasses = {
    primary:
      "bg-blue-500 dark:bg-blue-600 active:bg-blue-600 dark:active:bg-blue-700",
    secondary:
      "bg-gray-500 dark:bg-gray-600 active:bg-gray-600 dark:active:bg-gray-700",
    outline:
      "border-2 border-blue-500 dark:border-blue-400 bg-transparent active:bg-blue-50 dark:active:bg-blue-900/20",
  };

  const sizeClasses = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  const textVariantClasses = {
    primary: "text-white font-semibold",
    secondary: "text-white font-semibold",
    outline: "text-blue-500 dark:text-blue-400 font-semibold",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const disabledClasses = disabled ? "opacity-50" : "";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        className
      )}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? "#3b82f6" : "#ffffff"}
          className="mr-2"
        />
      )}
      <Text className={cn(textVariantClasses[variant], textSizeClasses[size])}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
