import React, { ReactNode, useRef, useState, useContext, createContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type CacheItem = {
    component: ReactNode;
    lastAccessed: number;
};

interface KeepAliveContextType {
    cache: Map<string, CacheItem>;
    add: (key: string, component: ReactNode) => void;
    remove: (key: string) => void;
    clear: () => void;
}

// 创建 Context
const KeepAliveContext = createContext<KeepAliveContextType>({
    cache: new Map(),
    add: () => { },
    remove: () => { },
    clear: () => { },
});

export const useKeepAliveCache = () => useContext(KeepAliveContext);

interface KeepAliveProviderProps {
    children: ReactNode;
    // 最大缓存数量
    maxSize?: number;
    // 最大闲置时间 (毫秒)
    maxIdle?: number;
    // 定时清理周期 (毫秒)
    cleanupInterval?: number;
}

/**
 * 路由缓存提供者
 * 用于在整个应用中提供路由缓存
 */
export const KeepAliveProvider: React.FC<KeepAliveProviderProps> = ({
    children,
    maxSize = 10,
    maxIdle = 30 * 60 * 1000, // 默认 30 分钟
    cleanupInterval = 5 * 60 * 1000, // 默认 5 分钟
}) => {
    const cacheRef = useRef(new Map<string, CacheItem>());

    // 添加到缓存
    const add = (key: string, component: ReactNode) => {
        // 如果达到最大缓存数量，移除最久未访问的项
        if (cacheRef.current.size >= maxSize) {
            let oldestKey = '';
            let oldestTime = Date.now();

            cacheRef.current.forEach((value, k) => {
                if (value.lastAccessed < oldestTime) {
                    oldestTime = value.lastAccessed;
                    oldestKey = k;
                }
            });

            if (oldestKey) {
                cacheRef.current.delete(oldestKey);
            }
        }

        cacheRef.current.set(key, {
            component,
            lastAccessed: Date.now(),
        });
    };

    // 从缓存移除
    const remove = (key: string) => {
        cacheRef.current.delete(key);
    };

    // 清空缓存
    const clear = () => {
        cacheRef.current.clear();
    };

    // 定期清理缓存中过期的项
    useEffect(() => {
        const cleanup = () => {
            const now = Date.now();
            cacheRef.current.forEach((value, key) => {
                if (now - value.lastAccessed > maxIdle) {
                    cacheRef.current.delete(key);
                }
            });
        };

        const intervalId = setInterval(cleanup, cleanupInterval);
        return () => clearInterval(intervalId);
    }, [maxIdle, cleanupInterval]);

    const contextValue = {
        cache: cacheRef.current,
        add,
        remove,
        clear,
    };

    return (
        <KeepAliveContext.Provider value={contextValue}>
            {children}
        </KeepAliveContext.Provider>
    );
};

interface KeepAliveRouteProps {
    children: ReactNode;
    cacheKey?: string;
    // 是否缓存该路由
    keepAlive?: boolean;
    // 路由激活时的回调
    onActivate?: () => void;
    // 路由失活时的回调
    onDeactivate?: () => void;
}

/**
 * 可缓存的路由组件
 * 当 keepAlive 为 true 时，该组件被卸载时会被缓存，下次挂载时从缓存中恢复
 */
export const KeepAliveRoute: React.FC<KeepAliveRouteProps> = ({
    children,
    cacheKey,
    keepAlive = true,
    onActivate,
    onDeactivate,
}) => {
    const { cache, add, remove } = useKeepAliveCache();
    const location = useLocation();
    const key = cacheKey || location.pathname;

    // 如果当前路由需要缓存并且缓存中存在该路由，则使用缓存
    if (keepAlive && cache.has(key)) {
        const item = cache.get(key)!;
        // 更新最后访问时间
        item.lastAccessed = Date.now();

        // 触发激活回调
        useEffect(() => {
            onActivate?.();
            return () => onDeactivate?.();
        }, []);

        return <>{item.component}</>;
    }

    // 监听组件挂载/卸载，缓存当前路由
    useEffect(() => {
        if (keepAlive) {
            onActivate?.();

            return () => {
                add(key, children);
                onDeactivate?.();
            };
        } else {
            onActivate?.();
            return () => {
                remove(key);
                onDeactivate?.();
            };
        }
    }, [key, keepAlive, children]);

    return <>{children}</>;
};

// 高阶组件用法
export function withKeepAlive<P extends object>(
    Component: React.ComponentType<P>,
    options?: Omit<KeepAliveRouteProps, 'children'>
): React.FC<P> {
    const WithKeepAlive: React.FC<P> = (props) => (
        <KeepAliveRoute {...options}>
            <Component {...props} />
        </KeepAliveRoute>
    );

    WithKeepAlive.displayName = `WithKeepAlive(${Component.displayName || Component.name || 'Component'})`;
    return WithKeepAlive;
} 