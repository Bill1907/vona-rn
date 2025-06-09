import React from "react";
import Svg, { G, Rect } from "react-native-svg";
import { SvgIconProps } from "./types";

export const PauseIcon: React.FC<SvgIconProps> = ({
  size = 24,
  color = "#000000",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Rect x="6" y="4" width="4" height="16" fill={color} />
      <Rect x="14" y="4" width="4" height="16" fill={color} />
    </G>
  </Svg>
);
