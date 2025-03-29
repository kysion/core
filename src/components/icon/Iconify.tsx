import { Icon } from '@iconify/react';
import React from 'react';

interface IconifyIconProps {
  icon: string;
  width?: number | string;
  height?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const IconifyIcon = ({
  icon,
  width = 20,
  height = 20,
  color,
  className = '',
  style = {},
  onClick,
}: IconifyIconProps) => {
  return (
    <Icon
      icon={icon}
      width={width}
      height={height}
      color={color}
      className={className}
      style={style}
      onClick={onClick}
    />
  );
};

export default IconifyIcon;