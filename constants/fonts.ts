export const fonts = {
  pretendard: {
    light: "Pretendard-Light",
    regular: "Pretendard-Regular",
    medium: "Pretendard-Medium",
    semiBold: "Pretendard-SemiBold",
    bold: "Pretendard-Bold",
    extraBold: "Pretendard-ExtraBold",
  },
  poppins: {
    light: "Poppins-Light",
    regular: "Poppins-Regular",
    medium: "Poppins-Medium",
    semiBold: "Poppins-SemiBold",
    bold: "Poppins-Bold",
    extraBold: "Poppins-ExtraBold",
  },
} as const;

export type FontWeight = keyof typeof fonts.pretendard;

/**
 * 텍스트에 한글이 포함되어 있는지 확인
 */
export const hasKorean = (text: string): boolean => {
  const koreanPattern = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  return koreanPattern.test(text);
};

/**
 * 텍스트에 숫자가 포함되어 있는지 확인
 */
export const hasNumbers = (text: string): boolean => {
  const numberPattern = /[0-9]/;
  return numberPattern.test(text);
};

/**
 * 텍스트 내용에 따라 적절한 폰트 패밀리를 반환
 * 한글이나 숫자가 포함된 경우 Pretendard, 영어만 있는 경우 Poppins
 */
export const getFontFamily = (
  text: string,
  weight: FontWeight = "regular"
): string => {
  if (hasKorean(text) || hasNumbers(text)) {
    return fonts.pretendard[weight];
  }
  return fonts.poppins[weight];
};

/**
 * weight에 따른 fontWeight 스타일 반환
 */
export const getFontWeight = (weight: FontWeight): string => {
  const weightMap: Record<FontWeight, string> = {
    light: "300",
    regular: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
    extraBold: "800",
  };
  return weightMap[weight];
};
