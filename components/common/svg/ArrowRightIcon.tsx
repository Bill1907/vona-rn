import React from "react";
import Svg, { G, Line, Path } from "react-native-svg";
import { SvgIconProps } from "./types";

export const ArrowRightIcon: React.FC<SvgIconProps> = ({
  size = 24,
  color = "#000000",
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M12 5l7 7-7 7"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
    </G>
  </Svg>
);
