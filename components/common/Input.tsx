import { cn } from "@/lib/utils";
import React from "react";
import { Text, TextInput, View } from "react-native";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
  inputClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  className,
  inputClassName,
}) => {
  return (
    <View className={cn("mb-4", className)}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        className={cn(
          "border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3 text-base",
          "focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400",
          "text-gray-900 dark:text-white",
          error ? "border-red-500 dark:border-red-400" : "",
          disabled
            ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            : "bg-white dark:bg-gray-900",
          inputClassName
        )}
        placeholderTextColor="#9ca3af"
      />
      {error && (
        <Text className="text-sm text-red-500 dark:text-red-400 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
};
