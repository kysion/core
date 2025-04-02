import { KyRouteConfig } from "../types/route"
import React, { ComponentType, LazyExoticComponent, ReactElement, ReactNode } from "react"
import { Outlet, RouteObject } from "react-router-dom"
import { LazyImport } from "./LazyImport"
import { ErrorBoundary } from "./ErrorBoundary"
import { RouteGuard } from "./RouteGuard"
import { KeepAliveRoute } from "./KeepAliveRoute"

// 检查是否为 React.lazy 组件
const isLazyComponent = (component: any): boolean =>
    typeof component === "object" &&
    component !== null &&
    component.$$typeof?.toString() === "Symbol(react.lazy)"

export const buildRoutes = (
    routes: KyRouteConfig[],
    options?: {
        authCheck?: (route: KyRouteConfig) => boolean | Promise<boolean>;
        getUserInfo?: () => { roles?: string[]; permissions?: string[] } | Promise<{ roles?: string[]; permissions?: string[] }>;
        onRouteChange?: (to: any, from: any) => void;
    }
): RouteObject[] => {
    return routes.map((item) => {
        const {
            element,
            middlewares,
            children,
            ErrorBoundary: CustomErrorBoundary,
            meta,
            guard,
            redirect,
            preload,
            lazyOptions,
            ...restProps
        } = item

        // 校验 children 是否为有效数组
        if (children && !Array.isArray(children)) {
            throw new Error("Invalid children in route config")
        }

        // 要返回的路由对象
        let routeObject: RouteObject = {
            ...restProps,
        }

        // 递归构建子路由
        if (children && children.length > 0) {
            routeObject.children = buildRoutes(children, options)
        }

        // 处理重定向
        if (redirect) {
            routeObject.element = <Navigate to={redirect} replace />
            return routeObject
        }

        // 处理 element
        let routeElement: ReactNode

        if (isLazyComponent(element)) {
            // React.lazy 组件
            routeElement = (
                <LazyImport
                    lazy={element as LazyExoticComponent<ComponentType>}
                    prefetch={lazyOptions?.prefetch}
                    fallback={lazyOptions?.fallback}
                />
            )
        } else {
            routeElement = element as ReactElement ?? <Outlet />
        }

        // 处理组件缓存
        if (meta?.keepAlive) {
            routeElement = (
                <KeepAliveRoute
                    cacheKey={routeObject.path}
                    keepAlive={meta.keepAlive}
                >
                    {routeElement}
                </KeepAliveRoute>
            )
        }

        // 权限控制和路由守卫
        routeElement = (
            <RouteGuard
                route={item}
                authCheck={options?.authCheck}
                getUserInfo={options?.getUserInfo}
                onRouteChange={options?.onRouteChange}
            >
                {routeElement}
            </RouteGuard>
        )

        // 错误边界
        routeElement = CustomErrorBoundary ? (
            <CustomErrorBoundary>
                {routeElement}
            </CustomErrorBoundary>
        ) : (
            <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
                {routeElement}
            </ErrorBoundary>
        )

        // 中间件处理
        if (middlewares && Array.isArray(middlewares) && middlewares.length > 0) {
            // 创建中间件链
            let middlewareChain: ReactNode = routeElement

            for (let i = middlewares.length - 1; i >= 0; i--) {
                const middleware = middlewares[i]

                if (isLazyComponent(middleware)) {
                    middlewareChain = (
                        <LazyImport lazy={middleware as LazyExoticComponent<ComponentType>}>
                            {middlewareChain}
                        </LazyImport>
                    )
                } else {
                    middlewareChain = React.createElement(middleware as ComponentType, {}, middlewareChain)
                }
            }

            routeElement = middlewareChain
        }

        // 设置最终的路由元素
        routeObject.element = routeElement

        // 返回路由对象
        return routeObject
    })
}

interface RouteProviderProps {
    routes: KyRouteConfig[];
    authCheck?: (route: KyRouteConfig) => boolean | Promise<boolean>;
    getUserInfo?: () => { roles?: string[]; permissions?: string[] } | Promise<{ roles?: string[]; permissions?: string[] }>;
    onRouteChange?: (to: any, from: any) => void;
    children?: ReactNode;
}

// 导入所需类型
import { createBrowserRouter, createHashRouter, RouterProvider, Navigate } from "react-router-dom";

export const RouterConfig: React.FC<{
    routes: KyRouteConfig[];
    basename?: string;
    type?: 'hash' | 'browser';
    fallback?: ReactNode;
    options?: Omit<RouteProviderProps, 'routes' | 'children'>;
}> = ({
    routes,
    basename = '/',
    type = 'browser',
    fallback,
    options
}) => {
        // 构建路由配置
        const routeObjects = buildRoutes(routes, options);

        // 创建路由器
        const router = type === 'hash'
            ? createHashRouter(routeObjects, { basename })
            : createBrowserRouter(routeObjects, { basename });

        // 提供路由
        return (
            <RouterProvider
                router={router}
                fallbackElement={fallback}
            />
        );
    };

// 路由 Context
export const RouteContext = React.createContext<{
    routes: KyRouteConfig[];
}>({ routes: [] });

// 路由提供者
export const RouteProvider: React.FC<RouteProviderProps> = ({
    routes,
    authCheck,
    getUserInfo,
    onRouteChange,
    children
}) => {
    return (
        <RouteContext.Provider value={{ routes }}>
            {children}
        </RouteContext.Provider>
    );
};

// 路由钩子
export function useRoutes() {
    return React.useContext(RouteContext).routes;
}