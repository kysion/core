import { memo } from 'react';
import { IconFont } from './Iconfont';
import { Icon as Iconify, IconProps } from '@iconify/react';
import { IconFontProps } from '@ant-design/icons/lib/components/IconFont';
import { IconLocal } from './IconLocal';
import React from 'react';

export * from './IconSelect';
export * from './IconLocal';
export * from './Iconfont';
export * from './Iconify';

type BaseIconProps = {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

type IconFontIconProps = IconFontProps<string> & BaseIconProps & {
  icon: `iconfont:${string}`;
};

type LocalIconProps = {
  icon: `local:${string}`;
} & BaseIconProps;

type IconifyIconProps = IconProps & BaseIconProps & {
  icon: string;
};

export type KyIconProps = IconFontIconProps | LocalIconProps | IconifyIconProps;

export const KyIcon = memo<KyIconProps>((props) => {
  if (props.icon.startsWith('iconfont:')) {
    return (
      <IconFont
        {...(props as IconFontIconProps)}
        type={props.icon.replace('iconfont:', '')}
      />
    );
  }
  if (props.icon.startsWith('local:')) {
    return <IconLocal {...(props as LocalIconProps)} />;
  }

  return <Iconify {...(props as IconifyIconProps)} name={props.icon} />;
});
