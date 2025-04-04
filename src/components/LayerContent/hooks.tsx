import React, { useCallback, useEffect } from 'react';
import { Drawer, message } from 'antd';
import { DraggableModal } from '../DraggableModal';
import { useLayerContent } from './LayerContentProvider';
import { DrawerOptions, ModalOptions, SetTopLayerContentFunction } from './types';

/**
 * 使用模态框的钩子
 * @returns 显示模态框的函数
 */
export const useModal = () => {
    const { showContent, hideContent } = useLayerContent();

    return useCallback((options: ModalOptions): React.Key => {
        const id = options.identifier || `modal-${Date.now()}`;

        const handleClose = () => {
            hideContent(id);
            options.onCancel?.();
        };

        const handleOk = async () => {
            try {
                if (options.onOk) {
                    await options.onOk();
                }
                hideContent(id);
            } catch (error) {
                console.error('Modal onOk error:', error);
                message.error('操作失败');
            }
        };

        // 确定是否显示默认按钮
        const showOkButton = options.showOkButton !== false;
        const showCancelButton = options.showCancelButton !== false;

        // 组装默认页脚
        let defaultFooter;
        if (!showOkButton && !showCancelButton) {
            defaultFooter = null;
        }

        showContent({
            identifier: id,
            zIndex: options.zIndex,
            child: (
                <DraggableModal
                    title={options.title}
                    open={true}
                    width={options.width || 520}
                    onOk={handleOk}
                    onCancel={handleClose}
                    maskClosable={false}
                    destroyOnClose={true}
                    footer={options.footer}
                    okText={options.okText}
                    cancelText={options.cancelText}
                    okButtonProps={{ style: { display: showOkButton ? 'inline-block' : 'none' } }}
                    cancelButtonProps={{ style: { display: showCancelButton ? 'inline-block' : 'none' } }}
                >
                    {typeof options.content === 'function'
                        ? options.content(handleClose)
                        : options.content}
                </DraggableModal>
            )
        });

        return id;
    }, [showContent, hideContent]);
};

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
            child: (
                <Drawer
                    title={options.title}
                    open={true}
                    width={options.width || 500}
                    placement={options.placement || 'right'}
                    onClose={handleClose}
                    maskClosable={false}
                    destroyOnClose={true}
                    extra={options.extra}
                    styles={{
                        ...options.styles
                    }}
                >
                    {typeof options.content === 'function'
                        ? options.content(handleClose)
                        : options.content}
                </Drawer>
            )
        });

        return id;
    }, [showContent, hideContent]);
};

/**
 * 注册全局层级内容方法
 * 提供与旧版API兼容的window.$setTopLayerContent方法
 */
export const useRegisterGlobalMethods = () => {
    const { showContent, hideContent } = useLayerContent();

    useEffect(() => {
        // 保存原始方法（如果存在）
        const originalMethod = window.$setTopLayerContent;

        // 设置全局方法
        const setTopLayerContent: SetTopLayerContentFunction = (child, identifier) => {
            if (!child) {
                if (identifier) {
                    hideContent(identifier);
                }
            } else {
                showContent({
                    child,
                    identifier: identifier || `global-${Date.now()}`
                });
            }
        };

        window.$setTopLayerContent = setTopLayerContent;

        // 清理函数，恢复原始方法
        return () => {
            window.$setTopLayerContent = originalMethod;
        };
    }, [showContent, hideContent]);
};

/**
 * 创建全局层级内容注册组件
 * 用于在应用顶层注册兼容旧版API的全局方法
 */
export const GlobalLayerContentMethods: React.FC = () => {
    useRegisterGlobalMethods();
    return null;
}; 