import { FontWeight, getFontFamily, getFontWeight } from "@/constants/fonts";
import React from "react";
import { Text, TextProps, TextStyle } from "react-native";

export interface SmartTextProps extends TextProps {
  weight?: FontWeight;
  forceFontFamily?: "pretendard" | "poppins";
}

/**
 * 텍스트 내용에 따라 자동으로 적절한 폰트를 적용하는 Text 컴포넌트
 * - 한글/숫자가 포함된 경우: Pretendard
 * - 영어만 있는 경우: Poppins
 */
export const SmartText: React.FC<SmartTextProps> = ({
  children,
  style,
  weight = "regular",
  forceFontFamily,
  ...props
}) => {
  const textContent = typeof children === "string" ? children : "";

  let fontFamily: string;

  if (forceFontFamily) {
    // 강제로 특정 폰트 패밀리 사용
    if (forceFontFamily === "pretendard") {
      fontFamily = `Pretendard-${weight.charAt(0).toUpperCase() + weight.slice(1)}`;
    } else {
      fontFamily = `Poppins-${weight.charAt(0).toUpperCase() + weight.slice(1)}`;
    }
  } else {
    // 텍스트 내용에 따라 자동 선택
    fontFamily = getFontFamily(textContent, weight);
  }

  const fontWeight = getFontWeight(weight);

  const smartTextStyle: TextStyle = {
    fontFamily,
    fontWeight: fontWeight as any,
  };

  const combinedStyle = Array.isArray(style)
    ? [smartTextStyle, ...style]
    : [smartTextStyle, style];

  return (
    <Text style={combinedStyle} {...props}>
      {children}
    </Text>
  );
};
