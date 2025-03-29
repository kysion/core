import { memo } from 'react';
import { Image, ImageProps } from 'antd';
import React from 'react';

export interface IconLocalProps extends Omit<ImageProps, 'src'> {
  icon: string;
}

export const IconLocal = memo<IconLocalProps>(({ icon, style, ...props }) => {
  // 移除 'local:' 前缀获取实际图片路径
  const src = icon.replace('local:', '');

  // 检查文件扩展名
  const ext = src.split('.').pop()?.toLowerCase();
  const isSvg = ext === 'svg';

  // 如果是 SVG，使用 img 标签直接显示
  if (isSvg) {
    return (
      <img
        src={src}
        style={{ width: '1em', height: '1em', ...style }}
        {...props}
      />
    );
  }

  // 对于其他图片格式使用 antd 的 Image 组件
  return (
    <Image
      src={src}
      preview={false}
      style={{ width: '1em', height: '1em', ...style }}
      {...props}
    />
  );
}); 