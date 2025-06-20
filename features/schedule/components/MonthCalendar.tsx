import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useSchedule } from "../hooks/useSchedule";
import { CalendarDay, CalendarNavAction } from "../types";
import { getEndOfMonth, getStartOfMonth, isSameDay } from "../utils/dateUtils";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";

interface MonthCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const { getSchedulesByDateRange } = useSchedule();

  // 현재 월의 캘린더 데이터 생성
  const generateCalendarDays = (): CalendarDay[] => {
    const startOfMonth = getStartOfMonth(currentMonth);
    const endOfMonth = getEndOfMonth(currentMonth);

    // 월 시작일의 주 시작일 (일요일)
    const startDate = new Date(startOfMonth);
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    // 월 마지막일의 주 마지막일 (토요일)
    const endDate = new Date(endOfMonth);
    const endDay = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - endDay));

    // 해당 기간의 스케줄들 가져오기
    const schedules = getSchedulesByDateRange(startDate, endDate);

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const daySchedules = schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.start_time);
        return isSameDay(scheduleDate, currentDate);
      });

      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === currentMonth.getMonth(),
        isToday: isSameDay(currentDate, new Date()),
        isSelected: isSameDay(currentDate, selectedDate),
        schedules: daySchedules,
        hasSchedules: daySchedules.length > 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  useEffect(() => {
    setCalendarDays(generateCalendarDays());
  }, [currentMonth, selectedDate]);

  const handleNavigate = (action: CalendarNavAction) => {
    const newDate = new Date(currentMonth);

    switch (action) {
      case "prev":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "next":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "today":
        newDate.setTime(new Date().getTime());
        onDateSelect(new Date()); // 오늘 날짜 선택
        break;
    }

    setCurrentMonth(newDate);
  };

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);

    // 선택한 날짜가 현재 표시중인 월과 다르면 해당 월로 이동
    if (
      date.getMonth() !== currentMonth.getMonth() ||
      date.getFullYear() !== currentMonth.getFullYear()
    ) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  return (
    <View className="bg-transparent">
      <CalendarHeader
        currentDate={currentMonth}
        onNavigate={handleNavigate}
        showViewToggle={false}
      />
      <CalendarGrid
        days={calendarDays}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
    </View>
  );
};
