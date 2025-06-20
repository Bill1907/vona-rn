import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CalendarDay } from "../types";
import { isSameDay, isToday } from "../utils/dateUtils";

interface CalendarGridProps {
  days: CalendarDay[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  selectedDate,
  onDateSelect,
}) => {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

  // 번역된 요일 가져오기
  const getWeekDays = () => [
    t("calendar.weekDays.sunday"),
    t("calendar.weekDays.monday"),
    t("calendar.weekDays.tuesday"),
    t("calendar.weekDays.wednesday"),
    t("calendar.weekDays.thursday"),
    t("calendar.weekDays.friday"),
    t("calendar.weekDays.saturday"),
  ];

  const weekDays = getWeekDays();

  const renderWeekHeader = () => (
    <View className="flex-row mb-2">
      {weekDays.map((day, index) => (
        <View key={day} className="flex-1 items-center py-2">
          <Text
            className="text-sm font-medium"
            style={{
              color: colorScheme === "dark" ? "#9ca3af" : "#6b7280",
              ...(index === 0 && { color: "#ef4444" }), // 일요일 빨간색
              ...(index === 6 && { color: "#3b82f6" }), // 토요일 파란색
            }}
          >
            {day}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderDayCell = (day: CalendarDay, index: number) => {
    const isSelected = isSameDay(day.date, selectedDate);
    const isTodayDate = isToday(day.date);
    const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

    const baseTextColor = colorScheme === "dark" ? "#ffffff" : "#000000";
    const dimmedTextColor = colorScheme === "dark" ? "#6b7280" : "#9ca3af";
    const todayColor = "#3b82f6";
    const selectedBgColor = colorScheme === "dark" ? "#4f46e5" : "#6366f1";

    let textColor = day.isCurrentMonth ? baseTextColor : dimmedTextColor;
    if (day.date.getDay() === 0) textColor = "#ef4444"; // 일요일
    if (day.date.getDay() === 6) textColor = "#3b82f6"; // 토요일

    return (
      <TouchableOpacity
        key={`${day.date.getTime()}-${index}`}
        onPress={() => onDateSelect(day.date)}
        className="flex-1 aspect-square items-center justify-center relative"
        style={{
          backgroundColor: "transparent",
          margin: 1,
        }}
      >
        {/* 날짜 숫자 */}
        <View
          className="w-8 h-8 items-center justify-center"
          style={{
            backgroundColor: isSelected ? selectedBgColor : "transparent",
            borderRadius: 20, // 동그란 모양으로 변경
          }}
        >
          <Text
            className={`text-base font-medium ${isSelected ? "text-white" : ""}`}
            style={{
              color: isSelected ? "#ffffff" : textColor,
              ...(isTodayDate &&
                !isSelected && {
                  color: todayColor,
                  fontWeight: "bold",
                }),
            }}
          >
            {day.date.getDate()}
          </Text>
        </View>

        {/* 오늘 표시 */}
        {isTodayDate && !isSelected && (
          <View
            className="absolute bottom-1 w-1 h-1 rounded-full"
            style={{ backgroundColor: todayColor }}
          />
        )}

        {/* 일정 있음 표시 */}
        {day.hasSchedules && (
          <View className="flex-row absolute bottom-0 justify-center">
            {day.schedules.slice(0, 3).map((_, scheduleIndex) => (
              <View
                key={scheduleIndex}
                className="w-1 h-1 rounded-full mx-0.5"
                style={{
                  backgroundColor: isSelected ? "#ffffff" : "#10b981",
                }}
              />
            ))}
            {day.schedules.length > 3 && (
              <Text
                className="text-xs ml-1"
                style={{
                  color: isSelected ? "#ffffff" : "#6b7280",
                }}
              >
                +{day.schedules.length - 3}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderWeekRow = (weekDays: CalendarDay[], weekIndex: number) => (
    <View key={weekIndex} className="flex-row">
      {weekDays.map(renderDayCell)}
    </View>
  );

  // 7일씩 그룹화
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <View className="px-4">
      {renderWeekHeader()}
      <View className="space-y-1">{weeks.map(renderWeekRow)}</View>
    </View>
  );
};
