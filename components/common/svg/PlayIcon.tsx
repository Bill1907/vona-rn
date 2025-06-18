import React from "react";
import Svg, { Path } from "react-native-svg";
import { SvgIconProps } from "./types";

export const PlayIcon: React.FC<SvgIconProps> = ({
  size = 24,
  color = "#000000",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M8 5v14l11-7z" fill={color} />
  </Svg>
);
