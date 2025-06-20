import { ScreenBackground } from "@/components/common";
import { MonthCalendar } from "@/features/schedule/components/MonthCalendar";
import { ScheduleList } from "@/features/schedule/components/ScheduleList";
import { ScheduleModal } from "@/features/schedule/components/ScheduleModal";
import { useSchedule } from "@/features/schedule/hooks/useSchedule";
import { CalendarNavAction } from "@/features/schedule/types";
import { useTranslation } from "@/hooks/useTranslation";
import { Schedule } from "@/types";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const { schedules, isLoading, error, loadSchedules, getSchedulesByDate } =
    useSchedule();

  const { t } = useTranslation();

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleNavigate = (action: CalendarNavAction) => {
    const newDate = new Date(currentDate);

    switch (action) {
      case "prev":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "next":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "today":
        newDate.setTime(new Date().getTime());
        setSelectedDate(new Date());
        break;
    }

    setCurrentDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);

    // 선택한 날짜가 현재 표시중인 월과 다르면 해당 월로 이동
    if (
      date.getMonth() !== currentDate.getMonth() ||
      date.getFullYear() !== currentDate.getFullYear()
    ) {
      setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsModalVisible(true);
  };

  const handleSchedulePress = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingSchedule(null);
    loadSchedules(); // 모달 닫을 때 일정 목록 새로고침
  };

  // 선택된 날짜의 일정들 가져오기
  const selectedDateSchedules = getSchedulesByDate(selectedDate);

  return (
    <ScreenBackground
      variant="animated"
      isActive={true}
      includeSafeArea={false}
    >
      {/* 캘린더 */}
      <View className="mb-6">
        <MonthCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      </View>

      {/* 일정 목록 */}
      <View className="flex-1">
        <ScheduleList
          schedules={selectedDateSchedules}
          selectedDate={selectedDate}
          onSchedulePress={handleSchedulePress}
          onAddSchedule={handleAddSchedule}
        />
      </View>

      {/* 일정 추가/수정 모달 */}
      <ScheduleModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        schedule={editingSchedule}
        initialDate={selectedDate}
      />
    </ScreenBackground>
  );
}
