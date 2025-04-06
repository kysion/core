import React, { createContext, useContext, useEffect } from 'react';
import { notification } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';

// 创建通知上下文
const NotificationContext = createContext<NotificationInstance | null>(null);

/**
 * 通知提供者组件 - 提供全局通知功能
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notificationApi, contextHolder] = notification.useNotification();

    return (
        <NotificationContext.Provider value={{ ...notificationApi }}>
            {contextHolder}
            {children}
        </NotificationContext.Provider>
    );
};

/**
 * 使用通知的钩子
 * @throws 如果在NotificationProvider外部使用，会抛出错误
 */
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

/**
 * 注册全局通知方法组件
 * 将通知API注册到window.$notification全局变量
 */
export const GlobalNotificationMethods: React.FC = () => {
    const notificationApi = useNotification();

    useEffect(() => {
        window.$notification = notificationApi;

        return () => {
            window.$notification = undefined;
        };
    }, [notificationApi]);

    return null;
}; 