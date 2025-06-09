import React from "react";

export interface SvgIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export type SvgIconComponent = React.FC<SvgIconProps>;
