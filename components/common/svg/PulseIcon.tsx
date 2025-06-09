import React from "react";
import Svg, { Circle, G } from "react-native-svg";
import { SvgIconProps } from "./types";

export const PulseIcon: React.FC<SvgIconProps> = ({
  size = 24,
  color = "#000000",
  strokeWidth = 2,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle cx="12" cy="12" r="4" fill={color} />
    </G>
  </Svg>
);
