import React from "react";
import Svg, { G, Line, Path } from "react-native-svg";
import { SvgIconProps } from "./types";

export const ArrowDownIcon: React.FC<SvgIconProps> = ({
  size = 24,
  color = "#000000",
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Line
        x1="12"
        y1="5"
        x2="12"
        y2="19"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M19 12l-7 7-7-7"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
    </G>
  </Svg>
);
