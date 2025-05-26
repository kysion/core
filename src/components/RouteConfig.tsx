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

        // 如果上层已经提供 Component 并且未提供 element，直接使用，不再额外包装，防止在 Router 之外实例化
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (!element && (item as any).Component) {
            // 保证路径、子路由等正常递归处理
            if (children && children.length > 0) {
                routeObject.children = buildRoutes(children, options);
            }
            // 直接复用原组件
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            routeObject.Component = (item as any).Component;
            return routeObject;
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

        const buildWrappedNode = (node: ReactNode): ReactNode => {
            let wrapped = node;

            // 处理组件缓存
            if (meta?.keepAlive) {
                wrapped = (
                    <KeepAliveRoute cacheKey={routeObject.path} keepAlive={meta.keepAlive}>
                        {wrapped}
                    </KeepAliveRoute>
                );
            }

            // 权限控制
            wrapped = (
                <RouteGuard route={item} authCheck={options?.authCheck} getUserInfo={options?.getUserInfo} onRouteChange={options?.onRouteChange}>
                    {wrapped}
                </RouteGuard>
            );

            // 错误边界
            wrapped = CustomErrorBoundary ? (
                <CustomErrorBoundary>{wrapped}</CustomErrorBoundary>
            ) : (
                <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>{wrapped}</ErrorBoundary>
            );

            // 中间件
            if (middlewares && Array.isArray(middlewares) && middlewares.length > 0) {
                let chain: ReactNode = wrapped;
                for (let i = middlewares.length - 1; i >= 0; i--) {
                    const mw = middlewares[i];
                    if (isLazyComponent(mw)) {
                        chain = <LazyImport lazy={mw as LazyExoticComponent<ComponentType>}>{chain}</LazyImport>;
                    } else {
                        chain = React.createElement(mw as ComponentType, {}, chain);
                    }
                }
                wrapped = chain;
            }

            return wrapped;
        };

        if (isLazyComponent(element)) {
            const LazyComp = element as LazyExoticComponent<ComponentType>;
            const Wrapper: React.FC = () => buildWrappedNode(
                <LazyImport lazy={LazyComp} prefetch={lazyOptions?.prefetch} fallback={lazyOptions?.fallback} />
            );
            routeObject.Component = Wrapper;
        } else if (typeof element === 'function') {
            const Base = element as ComponentType;
            const Wrapper: React.FC = () => buildWrappedNode(<Base />);
            routeObject.Component = Wrapper;
        } else if (React.isValidElement(element)) {
            // ReactElement 已经创建，但仍需包装
            const Wrapper: React.FC = () => buildWrappedNode(element as ReactElement);
            routeObject.Component = Wrapper;
        } else {
            // fallback
            const Wrapper: React.FC = () => buildWrappedNode(<Outlet />);
            routeObject.Component = Wrapper;
        }

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