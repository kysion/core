import React, { useCallback } from 'react';
import { Drawer } from 'antd';
import { DrawerOptions } from '../types';
import { useLayerContent } from '../CoreLayerContentProvider';

/**
 * LayerDrawer组件 - 用于渲染抽屉
 */
const LayerDrawer: React.FC<{
    options: DrawerOptions;
    onClose: () => void;
}> = React.memo(({ options, onClose }) => {
    return (
        <Drawer
            title={options.title}
            open={true}
            width={options.width || 500}
            placement={options.placement || 'right'}
            onClose={onClose}
            maskClosable={false}
            destroyOnClose={true}
            extra={options.extra}
            styles={{
                ...options.styles
            }}
        >
            {typeof options.content === 'function'
                ? options.content(onClose)
                : options.content}
        </Drawer>
    );
});

/**
 * 使用抽屉的钩子
 * @returns 显示抽屉的函数
 */
export const useDrawer = () => {
    const { showContent, hideContent } = useLayerContent();

    return useCallback((options: DrawerOptions): React.Key => {
        const id = options.identifier || `drawer-${Date.now()}`;

        const handleClose = () => {
            hideContent(id);
            options.onClose?.();
        };

        showContent({
            identifier: id,
            zIndex: options.zIndex,
            onClose: options.onClose,
            child: <LayerDrawer options={options} onClose={handleClose} />
        });

        return id;
    }, [showContent, hideContent]);
};

export default LayerDrawer; 