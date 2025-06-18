import React from "react";
import Svg, { Rect } from "react-native-svg";
import { SvgIconProps } from "./types";

export const StopIcon: React.FC<SvgIconProps> = ({
  size = 24,
  color = "#000000",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="6" y="6" width="12" height="12" fill={color} />
  </Svg>
);
