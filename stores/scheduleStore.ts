import { supabase } from "@/api/supabaseClient";
import { Schedule } from "@/types";
import { Database } from "@/types/supabase";
import { create } from "zustand";

type CalendarEventInsert =
  Database["public"]["Tables"]["calendar_events"]["Insert"];

interface ScheduleStore {
  schedules: Schedule[];
  selectedDate: Date;
  currentSchedule: Schedule | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // 스케줄 로드
  loadSchedules: (month?: Date) => Promise<void>;

  // 특정 날짜의 스케줄들 가져오기
  getSchedulesByDate: (date: Date) => Schedule[];

  // 날짜 범위의 스케줄들 가져오기
  getSchedulesByDateRange: (startDate: Date, endDate: Date) => Schedule[];

  // 스케줄 CRUD
  createSchedule: (
    schedule: Omit<CalendarEventInsert, "user_id">
  ) => Promise<Schedule | null>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  // UI 상태 관리
  setSelectedDate: (date: Date) => void;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  clearError: () => void;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  schedules: [],
  selectedDate: new Date(),
  currentSchedule: null,
  isLoading: false,
  isSaving: false,
  error: null,

  // 스케줄 로드 (월별 또는 전체)
  loadSchedules: async (month?: Date) => {
    set({ isLoading: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("사용자가 로그인되어 있지 않습니다");
      }

      let query = supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true });

      // 월별 필터링이 있는 경우
      if (month) {
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(
          month.getFullYear(),
          month.getMonth() + 1,
          0
        );

        query = query
          .gte("start_time", startOfMonth.toISOString())
          .lte("start_time", endOfMonth.toISOString());
      }

      const { data: schedules, error } = await query;

      if (error) {
        throw error;
      }

      set({
        schedules: schedules || [],
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load schedules:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "스케줄을 불러오는데 실패했습니다",
        isLoading: false,
      });
    }
  },

  // 특정 날짜의 스케줄들 가져오기
  getSchedulesByDate: (date: Date) => {
    const { schedules } = get();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.start_time);
      return scheduleDate >= targetDate && scheduleDate < nextDate;
    });
  },

  // 날짜 범위의 스케줄들 가져오기
  getSchedulesByDateRange: (startDate: Date, endDate: Date) => {
    const { schedules } = get();

    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.start_time);
      return scheduleDate >= startDate && scheduleDate <= endDate;
    });
  },

  // 새 스케줄 생성
  createSchedule: async (scheduleData) => {
    set({ isSaving: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("사용자가 로그인되어 있지 않습니다");
      }

      const { data: newSchedule, error } = await supabase
        .from("calendar_events")
        .insert({
          ...scheduleData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 로컬 상태 업데이트
      const { schedules } = get();
      const updatedSchedules = [...schedules, newSchedule].sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

      set({
        schedules: updatedSchedules,
        isSaving: false,
      });

      return newSchedule;
    } catch (error) {
      console.error("Failed to create schedule:", error);
      set({
        error:
          error instanceof Error ? error.message : "스케줄 생성에 실패했습니다",
        isSaving: false,
      });
      return null;
    }
  },

  // 스케줄 업데이트
  updateSchedule: async (id: string, updates) => {
    set({ isSaving: true, error: null });

    try {
      const { data: updatedSchedule, error } = await supabase
        .from("calendar_events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 로컬 상태 업데이트
      const { schedules } = get();
      const updatedSchedules = schedules
        .map((schedule) => (schedule.id === id ? updatedSchedule : schedule))
        .sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );

      set({
        schedules: updatedSchedules,
        isSaving: false,
        currentSchedule:
          get().currentSchedule?.id === id
            ? updatedSchedule
            : get().currentSchedule,
      });
    } catch (error) {
      console.error("Failed to update schedule:", error);
      set({
        error:
          error instanceof Error ? error.message : "스케줄 수정에 실패했습니다",
        isSaving: false,
      });
    }
  },

  // 스케줄 삭제
  deleteSchedule: async (id: string) => {
    set({ isSaving: true, error: null });

    try {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // 로컬 상태 업데이트
      const { schedules } = get();
      const updatedSchedules = schedules.filter(
        (schedule) => schedule.id !== id
      );

      set({
        schedules: updatedSchedules,
        isSaving: false,
        currentSchedule:
          get().currentSchedule?.id === id ? null : get().currentSchedule,
      });
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      set({
        error:
          error instanceof Error ? error.message : "스케줄 삭제에 실패했습니다",
        isSaving: false,
      });
    }
  },

  // 선택된 날짜 설정
  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
  },

  // 현재 스케줄 설정
  setCurrentSchedule: (schedule: Schedule | null) => {
    set({ currentSchedule: schedule });
  },

  // 에러 클리어
  clearError: () => {
    set({ error: null });
  },
}));
