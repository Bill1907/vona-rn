import { useScheduleStore } from "@/stores/scheduleStore";
import { Schedule } from "@/types";
import { Database } from "@/types/supabase";
import { useEffect } from "react";
import {
  formatDateForDisplay,
  formatDuration,
  formatTimeRange,
  getScheduleDuration,
} from "../utils/dateUtils";

type CalendarEventInsert =
  Database["public"]["Tables"]["calendar_events"]["Insert"];

/**
 * 스케줄 관리를 위한 메인 훅
 */
export const useSchedule = () => {
  const {
    schedules,
    selectedDate,
    currentSchedule,
    isLoading,
    isSaving,
    error,
    loadSchedules,
    getSchedulesByDate,
    getSchedulesByDateRange,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    setSelectedDate,
    setCurrentSchedule,
    clearError,
  } = useScheduleStore();

  // 컴포넌트 마운트 시 스케줄 로드
  useEffect(() => {
    loadSchedules();
  }, []);

  // 선택된 날짜의 스케줄들
  const todaySchedules = getSchedulesByDate(selectedDate);

  // 이번 주 스케줄들
  const thisWeekSchedules = (() => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return getSchedulesByDateRange(startOfWeek, endOfWeek);
  })();

  // 이번 달 스케줄들
  const thisMonthSchedules = (() => {
    const startOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    );
    return getSchedulesByDateRange(startOfMonth, endOfMonth);
  })();

  return {
    // 상태
    schedules,
    selectedDate,
    currentSchedule,
    isLoading,
    isSaving,
    error,

    // 필터된 스케줄들
    todaySchedules,
    thisWeekSchedules,
    thisMonthSchedules,

    // 액션들
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    setSelectedDate,
    setCurrentSchedule,
    clearError,

    // 유틸리티 함수들
    getSchedulesByDate,
    getSchedulesByDateRange,
  };
};

/**
 * 스케줄 포맷팅을 위한 훅
 */
export const useScheduleFormat = () => {
  return {
    formatDateForDisplay,
    formatTimeRange,
    formatDuration,
    getScheduleDuration,
  };
};

/**
 * 특정 날짜의 스케줄만을 관리하는 훅
 */
export const useDaySchedules = (date: Date) => {
  const { getSchedulesByDate, loadSchedules, isLoading } = useScheduleStore();

  useEffect(() => {
    loadSchedules();
  }, [date]);

  const daySchedules = getSchedulesByDate(date);
  const hasSchedules = daySchedules.length > 0;

  return {
    schedules: daySchedules,
    hasSchedules,
    isLoading,
    count: daySchedules.length,
  };
};

/**
 * 스케줄 생성/편집을 위한 훅
 */
export const useScheduleForm = () => {
  const { createSchedule, updateSchedule, isSaving, error, clearError } =
    useScheduleStore();

  const handleCreate = async (
    scheduleData: Omit<CalendarEventInsert, "user_id">
  ) => {
    clearError();
    const result = await createSchedule(scheduleData);
    return result;
  };

  const handleUpdate = async (id: string, updates: Partial<Schedule>) => {
    clearError();
    await updateSchedule(id, updates);
  };

  return {
    createSchedule: handleCreate,
    updateSchedule: handleUpdate,
    isSaving,
    error,
    clearError,
  };
};

/**
 * 스케줄 검색/필터링을 위한 훅
 */
export const useScheduleSearch = () => {
  const { schedules } = useScheduleStore();

  const searchSchedules = (query: string) => {
    if (!query.trim()) return schedules;

    const lowercaseQuery = query.toLowerCase();
    return schedules.filter(
      (schedule) =>
        schedule.title.toLowerCase().includes(lowercaseQuery) ||
        (schedule.description &&
          schedule.description.toLowerCase().includes(lowercaseQuery))
    );
  };

  const filterByDateRange = (startDate: Date, endDate: Date) => {
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.start_time);
      return scheduleDate >= startDate && scheduleDate <= endDate;
    });
  };

  return {
    searchSchedules,
    filterByDateRange,
  };
};
