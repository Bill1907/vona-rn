import React from "react";
import Svg, { G, Line } from "react-native-svg";
import { SvgIconProps } from "./types";

export const CloseIcon: React.FC<SvgIconProps> = ({
  size = 24,
  color = "#000000",
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Line
        x1="18"
        y1="6"
        x2="6"
        y2="18"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </G>
  </Svg>
);
