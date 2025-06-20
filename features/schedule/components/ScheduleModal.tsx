import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Schedule } from "@/types";
import { Database } from "@/types/supabase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useScheduleForm } from "../hooks/useSchedule";
import {
  combineDateTime,
  extractDate,
  extractTime,
  formatTimeToString,
} from "../utils/dateUtils";

type CalendarEventInsert =
  Database["public"]["Tables"]["calendar_events"]["Insert"];

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  schedule?: Schedule | null; // 편집시 전달되는 기존 스케줄
  initialDate?: Date; // 새 스케줄 추가시 기본 날짜
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  visible,
  onClose,
  schedule,
  initialDate = new Date(),
}) => {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const { createSchedule, updateSchedule, isSaving, error, clearError } =
    useScheduleForm();

  // 폼 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const isEditing = !!schedule;

  // 스케줄 데이터로 폼 초기화
  useEffect(() => {
    if (schedule) {
      setTitle(schedule.title);
      setDescription(schedule.description || "");
      setDate(extractDate(schedule.start_time));
      setStartTime(extractTime(schedule.start_time));
      setEndTime(extractTime(schedule.end_time));
    } else {
      // 새 스케줄 초기화
      setTitle("");
      setDescription("");
      setDate(initialDate);
      setStartTime("09:00");
      setEndTime("10:00");
    }
  }, [schedule, initialDate, visible]);

  // 모달이 닫힐 때 에러 초기화
  useEffect(() => {
    if (!visible) {
      clearError();
    }
  }, [visible]);

  const backgroundColor = colorScheme === "dark" ? "#1f2937" : "#ffffff";
  const textColor = colorScheme === "dark" ? "#ffffff" : "#000000";
  const subtitleColor = colorScheme === "dark" ? "#d1d5db" : "#6b7280";
  const inputBg = colorScheme === "dark" ? "#374151" : "#f9fafb";
  const borderColor = colorScheme === "dark" ? "#4b5563" : "#e5e7eb";

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert(t("common.error"), t("pages.schedule.titleRequired"));
      return false;
    }

    // 시간 유효성 검사
    const startDateTime = combineDateTime(date, startTime);
    const endDateTime = combineDateTime(date, endTime);

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      Alert.alert(t("common.error"), t("pages.schedule.invalidTimeRange"));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const scheduleData: Omit<CalendarEventInsert, "user_id"> = {
      title: title.trim(),
      description: description.trim() || null,
      start_time: combineDateTime(date, startTime),
      end_time: combineDateTime(date, endTime),
    };

    try {
      if (isEditing && schedule) {
        await updateSchedule(schedule.id, scheduleData);
        Alert.alert(t("common.success"), t("pages.schedule.updateSuccess"));
      } else {
        await createSchedule(scheduleData);
        Alert.alert(t("common.success"), t("pages.schedule.createSuccess"));
      }
      onClose();
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setStartTime(formatTimeToString(selectedTime));
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setEndTime(formatTimeToString(selectedTime));
    }
  };

  const createTimeFromString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1" style={{ backgroundColor }}>
        {/* 헤더 */}
        <View
          className="flex-row items-center justify-between p-4 border-b"
          style={{ borderColor }}
        >
          <TouchableOpacity onPress={onClose}>
            <Text className="text-base" style={{ color: "#3b82f6" }}>
              {t("common.cancel")}
            </Text>
          </TouchableOpacity>

          <Text className="text-lg font-semibold" style={{ color: textColor }}>
            {isEditing
              ? t("pages.schedule.editSchedule")
              : t("pages.schedule.addSchedule")}
          </Text>

          <TouchableOpacity onPress={handleSave} disabled={isSaving}>
            <Text
              className="text-base font-medium"
              style={{
                color: isSaving ? subtitleColor : "#3b82f6",
                opacity: isSaving ? 0.5 : 1,
              }}
            >
              {t("common.save")}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* 제목 입력 */}
          <View className="mb-6">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: subtitleColor }}
            >
              {t("pages.schedule.scheduleTitle")} *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="일정 제목을 입력하세요"
              placeholderTextColor={subtitleColor}
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: inputBg,
                borderColor,
                color: textColor,
                fontSize: 16,
              }}
            />
          </View>

          {/* 날짜 선택 */}
          <View className="mb-6">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: subtitleColor }}
            >
              {t("pages.schedule.date")}
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center p-3 rounded-lg border"
              style={{ backgroundColor: inputBg, borderColor }}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={subtitleColor}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: textColor, fontSize: 16 }}>
                {date.toLocaleDateString("ko-KR")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 시간 선택 */}
          <View className="mb-6">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: subtitleColor }}
            >
              {t("pages.schedule.time")}
            </Text>
            <View className="flex-row space-x-3">
              {/* 시작 시간 */}
              <View className="flex-1">
                <Text className="text-xs mb-1" style={{ color: subtitleColor }}>
                  {t("pages.schedule.startTime")}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowStartTimePicker(true)}
                  className="flex-row items-center p-3 rounded-lg border"
                  style={{ backgroundColor: inputBg, borderColor }}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={subtitleColor}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: textColor, fontSize: 16 }}>
                    {startTime}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 종료 시간 */}
              <View className="flex-1">
                <Text className="text-xs mb-1" style={{ color: subtitleColor }}>
                  {t("pages.schedule.endTime")}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEndTimePicker(true)}
                  className="flex-row items-center p-3 rounded-lg border"
                  style={{ backgroundColor: inputBg, borderColor }}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={subtitleColor}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: textColor, fontSize: 16 }}>
                    {endTime}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 설명 입력 */}
          <View className="mb-6">
            <Text
              className="text-sm font-medium mb-2"
              style={{ color: subtitleColor }}
            >
              {t("pages.schedule.scheduleDescription")}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="일정 설명을 입력하세요 (선택사항)"
              placeholderTextColor={subtitleColor}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: inputBg,
                borderColor,
                color: textColor,
                fontSize: 16,
                minHeight: 100,
              }}
            />
          </View>

          {/* 에러 표시 */}
          {error && (
            <View
              className="mb-4 p-3 rounded-lg"
              style={{ backgroundColor: "#fef2f2" }}
            >
              <Text style={{ color: "#dc2626" }}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            value={createTimeFromString(startTime)}
            mode="time"
            display="default"
            onChange={handleStartTimeChange}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={createTimeFromString(endTime)}
            mode="time"
            display="default"
            onChange={handleEndTimeChange}
          />
        )}
      </View>
    </Modal>
  );
};
