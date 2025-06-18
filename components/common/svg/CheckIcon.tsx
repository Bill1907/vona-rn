import React from "react";
import Svg, { Path } from "react-native-svg";
import { SvgIconProps } from "./types";

export const CheckIcon: React.FC<SvgIconProps> = ({
  size = 24,
  color = "#000000",
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
    />
  </Svg>
);
