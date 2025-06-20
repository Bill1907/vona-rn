import { Schedule } from "@/types";

/**
 * 캘린더 뷰 타입
 */
export type CalendarView = "month" | "week" | "day" | "agenda";

/**
 * 스케줄 폼 데이터 타입
 */
export interface ScheduleFormData {
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  allDay?: boolean;
}

/**
 * 스케줄 생성 요청 타입
 */
export interface CreateScheduleRequest {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
}

/**
 * 스케줄 업데이트 요청 타입
 */
export interface UpdateScheduleRequest {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
}

/**
 * 캘린더 날짜 셀 타입
 */
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  schedules: Schedule[];
  hasSchedules: boolean;
}

/**
 * 주간 뷰를 위한 시간 슬롯 타입
 */
export interface TimeSlot {
  time: string;
  hour: number;
  schedules: Schedule[];
}

/**
 * 스케줄 검색 필터 타입
 */
export interface ScheduleFilter {
  query?: string;
  startDate?: Date;
  endDate?: Date;
  hasDescription?: boolean;
}

/**
 * 스케줄 정렬 옵션 타입
 */
export type ScheduleSortBy = "start_time" | "title" | "created_at";
export type SortOrder = "asc" | "desc";

export interface ScheduleSortOptions {
  sortBy: ScheduleSortBy;
  order: SortOrder;
}

/**
 * 스케줄 충돌 정보 타입
 */
export interface ScheduleConflict {
  conflictingSchedule: Schedule;
  overlapMinutes: number;
}

/**
 * 스케줄 통계 타입
 */
export interface ScheduleStats {
  totalSchedules: number;
  todaySchedules: number;
  thisWeekSchedules: number;
  thisMonthSchedules: number;
  upcomingSchedules: number;
}

/**
 * 캘린더 네비게이션 액션 타입
 */
export type CalendarNavAction = "prev" | "next" | "today";

/**
 * 스케줄 상태 타입
 */
export type ScheduleStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

/**
 * 알림 타입 (향후 확장용)
 */
export interface ScheduleReminder {
  id: string;
  scheduleId: string;
  reminderTime: string; // ISO string
  isEnabled: boolean;
  type: "notification" | "email" | "sms";
}

/**
 * 반복 일정 타입 (향후 확장용)
 */
export interface RecurringSchedule {
  id: string;
  pattern: "daily" | "weekly" | "monthly" | "yearly";
  interval: number; // 간격 (예: 2주마다 = interval: 2, pattern: 'weekly')
  endDate?: string; // ISO string
  occurrences?: number; // 총 반복 횟수
}

/**
 * 스케줄 카테고리 타입 (향후 확장용)
 */
export interface ScheduleCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export type { Schedule };
