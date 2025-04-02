import React, { FC, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { KyRouteConfig } from '../../types/route';

interface RoutePreloaderProps {
    routes: KyRouteConfig[];
    preloadDepth?: number; // 预加载深度
    preloadDistance?: number; // 预加载距离（鼠标移动距离阈值）
    preloadTimeout?: number; // 预加载超时（停留时间阈值）
    onPreload?: (path: string) => void;
}

// 从路由配置中提取所有路径
function extractPaths(routes: KyRouteConfig[], depth = 1, currentDepth = 0): string[] {
    if (currentDepth >= depth) return [];

    return routes.reduce<string[]>((paths, route) => {
        if (route.path) {
            // 确保路径以/开头
            const path = route.path.startsWith('/') ? route.path : `/${route.path}`;
            paths.push(path);
        }

        if (route.children && route.children.length > 0) {
            paths.push(...extractPaths(route.children, depth, currentDepth + 1));
        }

        return paths;
    }, []);
}

// 预加载LazyComponent
function preloadComponent(component: any): void {
    if (!component) return;

    // 检查是否为React.lazy组件
    if (
        typeof component === 'object' &&
        component !== null &&
        typeof component.$$typeof === 'symbol' &&
        component.$$typeof.toString() === 'Symbol(react.lazy)'
    ) {
        // 预加载React.lazy组件
        const lazyInitializer = Object.getOwnPropertyDescriptor(component, '_init')?.value;
        if (typeof lazyInitializer === 'function') {
            lazyInitializer();
        }
    }
}

// 查找特定路径的路由配置
function findRouteByPath(routes: KyRouteConfig[], path: string): KyRouteConfig | null {
    for (const route of routes) {
        if (route.path === path) {
            return route;
        }

        if (route.children) {
            const childRoute = findRouteByPath(route.children, path);
            if (childRoute) {
                return childRoute;
            }
        }
    }

    return null;
}

export const RoutePreloader: FC<RoutePreloaderProps> = ({
    routes,
    preloadDepth = 1,
    preloadDistance = 50,
    preloadTimeout = 500,
    onPreload,
}) => {
    const location = useLocation();
    const lastMoveRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const preloadedRef = useRef<Set<string>>(new Set());

    // 预加载特定路径的组件
    const preloadRoute = (path: string) => {
        // 跳过已预加载的路径
        if (preloadedRef.current.has(path)) return;

        // 查找对应的路由配置
        const route = findRouteByPath(routes, path);
        if (!route) return;

        // 预加载主组件
        if (route.element) {
            preloadComponent(route.element);
        }

        // 预加载中间件
        if (route.middlewares) {
            route.middlewares.forEach(middleware => preloadComponent(middleware));
        }

        // 标记为已预加载
        preloadedRef.current.add(path);
        onPreload?.(path);
    };

    // 初始化时预加载所有标记为需要预加载的路由
    useEffect(() => {
        const preloadRoutes = (routes: KyRouteConfig[]) => {
            routes.forEach(route => {
                if (route.preload && route.path) {
                    preloadRoute(route.path);
                }

                if (route.children) {
                    preloadRoutes(route.children);
                }
            });
        };

        preloadRoutes(routes);
    }, [routes]);

    // 预加载当前路径相关的路由
    useEffect(() => {
        const paths = extractPaths(routes, preloadDepth);
        paths.forEach(path => {
            preloadRoute(path);
        });
    }, [location.pathname, routes, preloadDepth]);

    // 鼠标移动时预加载
    useEffect(() => {
        const handleLinkHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');

            if (link) {
                const href = link.getAttribute('href');
                if (href && href.startsWith('/')) {
                    preloadRoute(href);
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const now = Date.now();
            const { x, y, time } = lastMoveRef.current;

            // 计算鼠标移动距离
            const distance = Math.sqrt(Math.pow(e.clientX - x, 2) + Math.pow(e.clientY - y, 2));

            // 如果鼠标移动距离超过阈值，重置定时器
            if (distance > preloadDistance) {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }

                // 更新最后移动位置和时间
                lastMoveRef.current = { x: e.clientX, y: e.clientY, time: now };

                // 设置新的定时器
                timerRef.current = setTimeout(() => {
                    // 当鼠标停留一段时间后预加载当前位置下的链接
                    const element = document.elementFromPoint(e.clientX, e.clientY);
                    if (element) {
                        const link = element.closest('a');
                        if (link) {
                            const href = link.getAttribute('href');
                            if (href && href.startsWith('/')) {
                                preloadRoute(href);
                            }
                        }
                    }
                }, preloadTimeout);
            }
        };

        // 注册事件监听
        document.addEventListener('mouseover', handleLinkHover);
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mouseover', handleLinkHover);
            document.removeEventListener('mousemove', handleMouseMove);

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [preloadDistance, preloadTimeout, routes]);

    // 返回空内容，因为这只是一个功能性组件
    return null;
};

// 高阶组件包装
export function withRoutePreloader<P extends object>(
    Component: React.ComponentType<P>,
    options?: RoutePreloaderProps
): React.FC<P & { routes: KyRouteConfig[] }> {
    return ({ routes, ...props }) => (
        <>
            <RoutePreloader routes={routes} {...options} />
            <Component {...(props as P)} />
        </>
    );
} 