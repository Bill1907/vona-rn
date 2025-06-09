import React from "react";
import Svg, { G, Line, Path } from "react-native-svg";
import { SvgIconProps } from "./types";

export const MicIcon: React.FC<SvgIconProps> = ({
  size = 24,
  color = "#000000",
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path
        d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Path
        d="M19 10v2a7 7 0 0 1-14 0v-2"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Line
        x1="12"
        y1="19"
        x2="12"
        y2="23"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1="8"
        y1="23"
        x2="16"
        y2="23"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </G>
  </Svg>
);
