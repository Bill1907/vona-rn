/**
 * 스케줄 관리를 위한 날짜 유틸리티 함수들
 */

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export const formatDateToString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * 시간을 HH:MM 형식으로 포맷
 */
export const formatTimeToString = (date: Date): string => {
  return date.toTimeString().split(" ")[0].substring(0, 5);
};

/**
 * 날짜와 시간을 합쳐서 ISO 문자열로 변환
 */
export const combineDateTime = (date: Date, time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
};

/**
 * ISO 문자열에서 날짜 추출
 */
export const extractDate = (isoString: string): Date => {
  return new Date(isoString.split("T")[0]);
};

/**
 * ISO 문자열에서 시간 추출 (HH:MM 형식)
 */
export const extractTime = (isoString: string): string => {
  return new Date(isoString).toTimeString().split(" ")[0].substring(0, 5);
};

/**
 * 두 날짜가 같은 날인지 확인
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateToString(date1) === formatDateToString(date2);
};

/**
 * 오늘 날짜인지 확인
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * 어제 날짜인지 확인
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

/**
 * 내일 날짜인지 확인
 */
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
};

/**
 * 월의 첫 번째 날 가져오기
 */
export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * 월의 마지막 날 가져오기
 */
export const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * 주의 첫 번째 날(월요일) 가져오기
 */
export const getStartOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 월요일 기준
  return new Date(date.setDate(diff));
};

/**
 * 주의 마지막 날(일요일) 가져오기
 */
export const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(new Date(date));
  return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
};

/**
 * 날짜를 사용자 친화적인 형식으로 포맷
 */
export const formatDateForDisplay = (
  date: Date,
  locale: string = "ko-KR"
): string => {
  if (isToday(date)) return "오늘";
  if (isYesterday(date)) return "어제";
  if (isTomorrow(date)) return "내일";

  return date.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

/**
 * 시간 범위를 사용자 친화적인 형식으로 포맷
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  const start = extractTime(startTime);
  const end = extractTime(endTime);
  return `${start} - ${end}`;
};

/**
 * 스케줄 지속 시간 계산 (분 단위)
 */
export const getScheduleDuration = (
  startTime: string,
  endTime: string
): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

/**
 * 지속 시간을 사용자 친화적인 형식으로 포맷
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
};
