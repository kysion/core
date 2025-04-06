import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { LayerContentContextType, LayerContentItem } from './types';

// 创建上下文
export const LayerContentContext = createContext<LayerContentContextType | null>(null);

/**
 * 核心层级内容提供者组件
 * 用于管理全局层级内容（弹窗、抽屉、模态框等）
 */
export const CoreLayerContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // 保存所有层级内容
    const [contents, setContents] = useState<LayerContentItem[]>([]);

    /**
     * 显示内容
     * @param content 要显示的内容配置
     * @returns 内容的唯一标识符
     */
    const showContent = useCallback((content: Omit<LayerContentItem, 'identifier'> & { identifier?: React.Key }) => {
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
    const updateContent = useCallback((identifier: React.Key, content: Partial<LayerContentItem>) => {
        setContents(prev => prev.map(item =>
            item.identifier === identifier ? { ...item, ...content } : item
        ));
    }, []);

    // 创建上下文值，使用useMemo避免不必要的重渲染
    const contextValue = useMemo(() => ({
        showContent,
        hideContent,
        updateContent,
        contents
    }), [showContent, hideContent, updateContent, contents]);

    // 按zIndex排序，确保渲染顺序正确
    const sortedContents = useMemo(() =>
        [...contents].sort((a, b) => (b.zIndex || 1000) - (a.zIndex || 1000)),
        [contents]
    );

    return (
        <LayerContentContext.Provider value={contextValue}>
            {children}
            {/* 渲染所有内容项 */}
            {sortedContents.length > 0 && sortedContents.map((item) => (
                <ContentItem key={`layer-${item.identifier}`} item={item} />
            ))}
        </LayerContentContext.Provider>
    );
};

/**
 * 使用React.memo优化层级内容项组件的渲染
 */
const ContentItem = React.memo(({ item }: { item: LayerContentItem }) => {
    return (
        <div style={{ zIndex: item.zIndex || 1000 }}>
            {item.child}
        </div>
    );
});

/**
 * 使用层级内容上下文的Hook
 * @throws 如果在CoreLayerContentProvider外部使用，会抛出错误
 */
export const useLayerContent = (): LayerContentContextType => {
    const context = useContext(LayerContentContext);
    if (!context) {
        throw new Error('useLayerContent must be used within a CoreLayerContentProvider');
    }
    return context;
}; 