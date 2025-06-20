import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CalendarNavAction } from "../types";

interface CalendarHeaderProps {
  currentDate: Date;
  onNavigate: (action: CalendarNavAction) => void;
  onViewChange?: () => void;
  showViewToggle?: boolean;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onNavigate,
  onViewChange,
  showViewToggle = false,
}) => {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

  const formatMonthYear = (date: Date) => {
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    const monthKey = monthNames[date.getMonth()];
    const translatedMonth = t(`calendar.monthsLong.${monthKey}`);
    const year = date.getFullYear();
    const yearText = t("calendar.year");

    // 한국어인 경우 "2024년 1월" 형식, 영어인 경우 "January 2024" 형식
    if (yearText) {
      return `${year}${yearText} ${translatedMonth}`;
    } else {
      return `${translatedMonth} ${year}`;
    }
  };

  const iconColor = colorScheme === "dark" ? "#ffffff" : "#000000";
  const textColor = colorScheme === "dark" ? "#ffffff" : "#000000";

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-transparent">
      {/* 이전 달 버튼 */}
      <TouchableOpacity
        onPress={() => onNavigate("prev")}
        className="p-2 rounded-full"
        style={{
          backgroundColor: colorScheme === "dark" ? "#374151" : "#f3f4f6",
        }}
      >
        <Ionicons name="chevron-back" size={20} color={iconColor} />
      </TouchableOpacity>

      {/* 중앙 날짜 영역 */}
      <View className="flex-1 flex-row items-center justify-center">
        <TouchableOpacity onPress={() => onNavigate("today")}>
          <Text
            className="text-lg font-semibold text-center"
            style={{ color: textColor }}
          >
            {formatMonthYear(currentDate)}
          </Text>
        </TouchableOpacity>

        {showViewToggle && (
          <TouchableOpacity onPress={onViewChange} className="ml-2 p-1 rounded">
            <Ionicons name="options" size={16} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* 다음 달 버튼 */}
      <TouchableOpacity
        onPress={() => onNavigate("next")}
        className="p-2 rounded-full"
        style={{
          backgroundColor: colorScheme === "dark" ? "#374151" : "#f3f4f6",
        }}
      >
        <Ionicons name="chevron-forward" size={20} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};
