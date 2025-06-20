import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Schedule } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { formatDateForDisplay, formatTimeRange } from "../utils/dateUtils";

interface ScheduleListProps {
  schedules: Schedule[];
  selectedDate: Date;
  onSchedulePress: (schedule: Schedule) => void;
  onAddSchedule: () => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  selectedDate,
  onSchedulePress,
  onAddSchedule,
}) => {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

  const sortedSchedules = schedules.sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const backgroundColor = colorScheme === "dark" ? "#1f2937" : "#ffffff";
  const cardBackground = colorScheme === "dark" ? "#374151" : "#f9fafb";
  const textColor = colorScheme === "dark" ? "#ffffff" : "#000000";
  const subtitleColor = colorScheme === "dark" ? "#d1d5db" : "#6b7280";
  const borderColor = colorScheme === "dark" ? "#4b5563" : "#e5e7eb";

  const formatSelectedDate = (date: Date) => {
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
    const day = date.getDate();

    return `${translatedMonth} ${day}`;
  };

  const renderScheduleItem = (schedule: Schedule, index: number) => (
    <TouchableOpacity
      key={schedule.id}
      onPress={() => onSchedulePress(schedule)}
      className="mb-3"
      style={{
        backgroundColor: cardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: borderColor,
      }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* 일정 제목 */}
          <Text
            className="text-base font-semibold mb-1"
            style={{ color: textColor }}
          >
            {schedule.title}
          </Text>

          {/* 시간 */}
          <View className="flex-row items-center mb-1">
            <Ionicons
              name="time-outline"
              size={14}
              color={subtitleColor}
              style={{ marginRight: 4 }}
            />
            <Text className="text-sm" style={{ color: subtitleColor }}>
              {formatTimeRange(schedule.start_time, schedule.end_time)}
            </Text>
          </View>

          {/* 설명 */}
          {schedule.description && (
            <Text
              className="text-sm mt-1"
              style={{ color: subtitleColor }}
              numberOfLines={2}
            >
              {schedule.description}
            </Text>
          )}
        </View>

        {/* 상태 표시 */}
        <View className="ml-3 items-center">
          <View
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#10b981" }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="items-center justify-center py-8">
      <Ionicons
        name="calendar-outline"
        size={48}
        color={subtitleColor}
        style={{ marginBottom: 16 }}
      />
      <Text className="text-base font-medium mb-2" style={{ color: textColor }}>
        {t("pages.schedule.noSchedulesToday")}
      </Text>
      <Text
        className="text-sm text-center mb-4"
        style={{ color: subtitleColor }}
      >
        {formatDateForDisplay(selectedDate)}에 일정이 없습니다
      </Text>
      <TouchableOpacity
        onPress={onAddSchedule}
        className="px-4 py-2 rounded-lg"
        style={{ backgroundColor: "#3b82f6" }}
      >
        <Text className="text-white font-medium">
          {t("pages.schedule.addSchedule")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-lg font-semibold" style={{ color: textColor }}>
          {formatSelectedDate(selectedDate)}
        </Text>
        <TouchableOpacity
          onPress={onAddSchedule}
          className="flex-row items-center px-3 py-2 rounded-lg"
          style={{ backgroundColor: "#3b82f6" }}
        >
          <Ionicons
            name="add"
            size={16}
            color="#ffffff"
            style={{ marginRight: 4 }}
          />
          <Text className="text-white font-medium text-sm">
            {t("pages.schedule.addSchedule")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 일정 목록 */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {sortedSchedules.length > 0 ? (
          <View className="pb-6">
            {sortedSchedules.map(renderScheduleItem)}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};
