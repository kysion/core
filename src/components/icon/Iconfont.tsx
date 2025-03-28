import { createFromIconfontCN } from '@ant-design/icons';
import { IconFontProps } from '@ant-design/icons/lib/components/IconFont';
import classNames from 'classnames';
import { memo } from 'react';

export const KysionIconFont = createFromIconfontCN({
  scriptUrl: [
    '//at.alicdn.com/t/c/font_4649830_nqsh8ncdz7t.js', // kysionIcons (overridden)
    '//at.alicdn.com/t/c/font_4663395_maxq9t1vj69.js', // 榴易
  ],
});

export const IconFont = memo<IconFontProps<string>>((props) => {
  return <KysionIconFont {...props} className={classNames('font-size-16px', props.className)} />;
});
