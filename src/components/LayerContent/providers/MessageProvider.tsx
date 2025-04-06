import React, { createContext, useContext, useEffect } from 'react';
import { message } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';

// 创建消息上下文
const MessageContext = createContext<MessageInstance | null>(null);

/**
 * 消息提供者组件 - 提供全局消息功能
 */
export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <MessageContext.Provider value={{ ...messageApi }}>
            {contextHolder}
            {children}
        </MessageContext.Provider>
    );
};

/**
 * 使用消息的钩子
 * @throws 如果在MessageProvider外部使用，会抛出错误
 */
export const useMessage = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context;
};

/**
 * 注册全局消息方法组件
 * 将消息API注册到window.$message全局变量
 */
export const GlobalMessageMethods: React.FC = () => {
    const messageApi = useMessage();

    useEffect(() => {
        window.$message = messageApi;

        return () => {
            window.$message = undefined;
        };
    }, [messageApi]);

    return null;
}; 