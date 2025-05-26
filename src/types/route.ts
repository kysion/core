import { ComponentType, ReactElement } from "react";
import { LazyComponent } from "../components/LazyImport";
import { RouteObject } from "react-router";
import { UserTypeSet } from "@kysion/types";

export interface RouteMeta {
    title?: string;                 // 路由标题
    titleKey?: string;              // 国际化标题键名
    icon?: string | ReactElement;   // 路由图标
    hidden?: boolean;               // 是否在导航中隐藏
    permissions?: string[];         // 路由所需权限
    roles?: string[];               // 路由所需角色
    userTypes?: UserTypeSet[];           // 路由所需用户类型
    keepAlive?: boolean;            // 是否缓存组件
    order?: number;                 // 排序
    breadcrumb?: boolean;           // 是否显示在面包屑
    activeMenu?: string;            // 激活的菜单
    noAuth?: boolean;               // 是否无需认证
    locale?: Record<string, string>; // 多语言配置
    [key: string]: any;             // 扩展字段
}

export interface RouteGuard {
    beforeEnter?: (to: any, from: any) => boolean | string | void | Promise<boolean | string | void>;
    afterEnter?: (to: any, from: any) => void | Promise<void>;
    beforeLeave?: (to: any, from: any) => boolean | void | Promise<boolean | void>;
}

// 路由配置类型
export type KyRouteConfig = Omit<
    RouteObject,
    'element' | 'children' | 'Component' | 'lazy'
> & {
    element?: LazyComponent | ReactElement;
    middlewares?: (LazyComponent | ComponentType)[];
    children?: KyRouteConfig[];
    ErrorBoundary?: ComponentType<{ children: ReactElement }>;
    // 新增配置项
    meta?: RouteMeta;
    guard?: RouteGuard;
    redirect?: string;
    preload?: boolean;
    lazyOptions?: {
        prefetch?: boolean;
        fallback?: ReactElement;
    };
}

// 路由状态接口
export interface RouteState {
    previousPath?: string;
    from?: string;
    [key: string]: any;
}

// 路由切换事件类型
export enum RouteEventType {
    BEFORE_ENTER = 'beforeEnter',
    AFTER_ENTER = 'afterEnter',
    BEFORE_LEAVE = 'beforeLeave',
}

// 路由事件接口
export interface RouteEvent {
    type: RouteEventType;
    path: string;
    timestamp: number;
    data?: any;
}

// 路由历史接口
export interface RouteHistory {
    push: (path: string, state?: RouteState) => void;
    replace: (path: string, state?: RouteState) => void;
    go: (delta: number) => void;
    back: () => void;
    forward: () => void;
    getState: () => RouteState | undefined;
    getLength: () => number;
    getEntries: () => { path: string, state?: RouteState }[];
}
