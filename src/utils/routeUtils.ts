import React from 'react';
import { KyRouteConfig } from '../types/route';
import { useMyProfileStore } from '../store/my/profileStore';
import { useMyProfileActions } from '../store/my/profileStore';

/**
 * 路由工具函数库 - 提供路由相关的通用工具函数
 */
export const RouteUtils = {
    /**
     * 判断路径是否为认证页面
     * @param path 路径
     * @returns 是否为认证页面
     */
    isAuthRoute: (path: string): boolean => {
        return path.indexOf('/auth') !== -1;
    },

    /**
     * 判断路径是否为根路径
     * @param path 路径
     * @returns 是否为根路径
     */
    isRootPath: (path: string): boolean => {
        return path === '/' || path === '';
    },

    /**
     * 获取登录状态
     * @returns 是否已登录
     */
    isAuthenticated: (): boolean => {
        const { token, isLoggedIn } = useMyProfileStore.getState();
        return isLoggedIn || !!token;
    },

    /**
     * 清除认证状态 - 用于处理token过期或无效的情况
     * 将清除存储中的认证相关信息
     */
    clearAuth: (): void => {
        try {
            // 使用actions中定义的logout方法
            const { logout } = useMyProfileActions();
            logout();
        } catch (error) {
            console.error('清除认证状态失败:', error);
            // 兜底方案：直接设置认证状态
            useMyProfileStore.setState({
                token: null,
                isLoggedIn: false,
                expireAt: ''
            });
        }
    },

    /**
     * 智能重定向 - 根据登录状态决定重定向目标
     * @param isAuthenticated 是否已认证
     * @param defaultAuthPath 默认认证路径
     * @param defaultAppPath 默认应用路径
     * @returns 重定向目标路径
     */
    smartRedirect: (
        isAuthenticated: boolean,
        defaultAuthPath: string = '/auth/login',
        defaultAppPath: string = '/workbench'
    ): string => {
        return isAuthenticated ? defaultAppPath : defaultAuthPath;
    },

    /**
     * 获取面包屑 - 根据当前路径和路由配置生成面包屑
     * @param routes 路由配置数组
     * @param currentPath 当前路径
     * @returns 面包屑数组
     */
    getBreadcrumbs: (routes: KyRouteConfig[], currentPath: string): Array<{ path: string, title: string }> => {
        const breadcrumbs: Array<{ path: string, title: string }> = [];
        const pathSegments = currentPath.split('/').filter(Boolean);

        let currentRoutes = routes;
        let currentPathPrefix = '';

        // 首页面包屑
        breadcrumbs.push({ path: '/', title: 'home' });

        // 遍历路径段构建面包屑
        for (const segment of pathSegments) {
            currentPathPrefix += `/${segment}`;

            // 在当前层级查找匹配的路由
            const matchedRoute = currentRoutes.find(route =>
                route.path === segment || route.path === currentPathPrefix
            );

            if (matchedRoute) {
                // 添加面包屑项
                breadcrumbs.push({
                    path: currentPathPrefix,
                    title: matchedRoute.meta?.titleKey || segment
                });

                // 如果有子路由，进入下一层级
                if (matchedRoute.children && matchedRoute.children.length > 0) {
                    currentRoutes = matchedRoute.children;
                }
            }
        }

        return breadcrumbs;
    },

    /**
     * 查找路由 - 根据路径在路由配置中查找匹配的路由
     * @param routes 路由配置数组
     * @param path 路径
     * @returns 匹配的路由或null
     */
    findRouteByPath: (routes: KyRouteConfig[], path: string): KyRouteConfig | null => {
        for (const route of routes) {
            // 处理根路径重定向
            if (route.path === '/' && route.redirect === path) {
                return route;
            }

            // 直接匹配
            if (route.path === path) {
                return route;
            }

            // 处理嵌套路由
            if (route.children) {
                const childPath = path.startsWith('/') ? path : `/${path}`;
                const childRoute = RouteUtils.findRouteByPath(route.children, childPath);
                if (childRoute) {
                    return childRoute;
                }
            }
        }

        return null;
    },

    /**
     * 创建路由配置 - 简化路由创建过程
     * @param path 路径
     * @param element 组件
     * @param options 选项
     * @returns 路由配置对象
     */
    createRoute: (
        path: string,
        element: any,
        options: {
            title?: string;
            icon?: string;
            public?: boolean;
            keepAlive?: boolean;
            roles?: string[];
            permissions?: string[];
            children?: KyRouteConfig[];
            redirect?: string;
        } = {}
    ): KyRouteConfig => {
        return {
            path,
            element,
            redirect: options.redirect,
            meta: {
                titleKey: options.title || path.split('/').pop() || '',
                icon: options.icon,
                noAuth: options.public || false,
                keepAlive: options.keepAlive || false,
                roles: options.roles || [],
                permissions: options.permissions || []
            },
            children: options.children || []
        };
    }
};

export default RouteUtils; 