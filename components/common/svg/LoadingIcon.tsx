import React from "react";
import Svg, { Path } from "react-native-svg";
import { SvgIconProps } from "./types";

export const LoadingIcon: React.FC<SvgIconProps> = ({
  size = 24,
  color = "#000000",
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M21 12a9 9 0 11-6.219-8.56"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
    />
  </Svg>
);
