import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { ModelContentContextType, ModelContentItem } from './types';
import { Flex } from 'antd';

// 创建上下文
export const ModelContentContext = createContext<ModelContentContextType | null>(null);

/**
 * 层级内容提供者组件
 * 用于管理全局层级内容（弹窗、抽屉、模态框等）
 */
export const ModelContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 保存所有层级内容
    const [contents, setContents] = useState<ModelContentItem[]>([]);

    /**
     * 显示内容
     * @param content 要显示的内容配置
     * @returns 内容的唯一标识符
     */
    const showContent = useCallback((content: Omit<ModelContentItem, 'identifier'> & { identifier?: React.Key }) => {
        const identifier = content.identifier || `layer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const contentWithId = { ...content, identifier };

        setContents(prev => [
            ...prev.filter(item => item.identifier !== identifier),
            contentWithId
        ]);

        return identifier;
    }, []);

    /**
     * 隐藏内容
     * @param identifier 内容的唯一标识符
     */
    const hideContent = useCallback((identifier: React.Key) => {
        setContents(prev => {
            const item = prev.find(item => item.identifier === identifier);
            // 调用onClose回调（如果存在）
            item?.onClose?.();
            return prev.filter(item => item.identifier !== identifier);
        });
    }, []);

    /**
     * 更新内容
     * @param identifier 内容的唯一标识符
     * @param content 要更新的内容配置
     */
    const updateContent = useCallback((identifier: React.Key, content: Partial<ModelContentItem>) => {
        setContents(prev => prev.map(item =>
            item.identifier === identifier ? { ...item, ...content } : item
        ));
    }, []);

    // 按zIndex排序，确保渲染顺序正确
    const sortedContents = [...contents].sort((a, b) => (b.zIndex || 1000) - (a.zIndex || 1000));

    return (
        <ModelContentContext.Provider value={{ showContent, hideContent, updateContent, contents }}>
            {children}
            {/* 渲染所有内容项 */}
            {sortedContents.length > 0 && sortedContents.map((item) => (
                <div key={`layer-${item.identifier}`} style={{ zIndex: item.zIndex || 1000 }}>
                    {item.child}
                </div>
            ))}
        </ModelContentContext.Provider>
    );
};

/**
 * 使用层级内容上下文的Hook
 * @throws 如果在ModelContentProvider外部使用，会抛出错误
 */
export const useModelContent = (): ModelContentContextType => {
    const context = useContext(ModelContentContext);
    if (!context) {
        throw new Error('useModelContent must be used within a ModelContentProvider');
    }
    return context;
}; 