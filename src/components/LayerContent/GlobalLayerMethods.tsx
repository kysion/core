import React, { useEffect } from 'react';
import { useLayerContent } from './CoreLayerContentProvider';
import { SetTopLayerContentFunction, ModalOptions, DrawerOptions } from './types';
import { GlobalMessageMethods } from './providers/MessageProvider';
import { GlobalNotificationMethods } from './providers/NotificationProvider';
import { useModal } from './implementations/LayerModal';
import { useDrawer } from './implementations/LayerDrawer';

/**
 * 注册全局层级内容方法
 * 提供与旧版API兼容的window.$setTopLayerContent方法
 */
export const useRegisterGlobalLayerContent = () => {
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
 * 注册全局Modal和Drawer方法
 * 提供简化的调用方式：window.$modal.show(), window.$drawer.show()
 */
export const useRegisterGlobalUIContent = () => {
    const showModal = useModal();
    const showDrawer = useDrawer();

    useEffect(() => {
        // 定义全局Modal方法
        window.$modal = {
            show: (options: ModalOptions) => showModal(options)
        };

        // 定义全局Drawer方法
        window.$drawer = {
            show: (options: DrawerOptions) => showDrawer(options)
        };

        return () => {
            window.$modal = undefined;
            window.$drawer = undefined;
        };
    }, [showModal, showDrawer]);
};

/**
 * 全局层级方法组件
 * 统一注册所有全局方法，包括LayerContent、Notification、Message、Modal和Drawer
 */
export const GlobalLayerMethods: React.FC = () => {
    // 注册全局层级内容方法
    useRegisterGlobalLayerContent();
    // 注册全局UI内容方法
    useRegisterGlobalUIContent();

    return (
        <>
            {/* 注册全局通知方法 */}
            <GlobalNotificationMethods />
            {/* 注册全局消息方法 */}
            <GlobalMessageMethods />
        </>
    );
}; 