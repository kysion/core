import React from "react";
import { CoreLayerContentProvider } from "./CoreLayerContentProvider";
import { NotificationProvider, MessageProvider } from "./providers";

/**
 * 层级内容提供者组件
 * 整合了所有子Provider，包括核心内容、通知和消息
 */
export const LayerContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <CoreLayerContentProvider>
            <NotificationProvider>
                <MessageProvider>
                    {children}
                </MessageProvider>
            </NotificationProvider>
        </CoreLayerContentProvider>
    );
};