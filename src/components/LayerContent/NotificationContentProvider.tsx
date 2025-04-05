import React, { createContext, useContext, useEffect } from 'react';
import { notification } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';

export const NotificationContext = createContext<NotificationInstance | null>(null);
export const NotificationContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notificationApi, contextHolder] = notification.useNotification();

    return (
        <NotificationContext.Provider value={{ ...notificationApi }}>
            {contextHolder}
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const GlobalNotificationMethods: React.FC = () => {
    const notificationApi = useNotification();
    useEffect(() => {
        window.$notification = notificationApi;
    }, [notificationApi]);
    return null;
}; 