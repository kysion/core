import React, { FC, ReactElement, ReactNode, useEffect, useState, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { Spin, Result, Button } from 'antd';
import { KyRouteConfig, RouteGuard as RouteGuardType } from '../../types/route';
import { RouteUtils } from '../../utils/routeUtils';

// 定义日志级别
export enum LogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4
}

export interface RouteGuardOptions {
    /**
     * 日志级别
     */
    logLevel?: LogLevel;

    /**
     * 启用权限结果缓存
     */
    enableCache?: boolean;

    /**
     * 缓存有效期（毫秒）
     */
    cacheTTL?: number;

    /**
     * 默认登录页路径
     */
    loginPath?: string;

    /**
     * 默认主页路径
     */
    homePath?: string;
}

export interface RouteGuardProps {
    children: ReactNode;
    route: KyRouteConfig;
    loading?: ReactElement;
    fallback?: ReactElement | string;
    // 权限验证函数
    authCheck?: (route: KyRouteConfig) => boolean | Promise<boolean>;
    // 获取用户信息函数
    getUserInfo?: () => { roles?: string[]; permissions?: string[] } | Promise<{ roles?: string[]; permissions?: string[] }>;
    // 事件回调
    onRouteChange?: (to: any, from: any) => void;
    // 配置选项
    options?: RouteGuardOptions;
}

// 用于路由切换动画的状态
export enum RouteTransitionState {
    ENTERING = 'entering',
    ENTERED = 'entered',
    EXITING = 'exiting',
    EXITED = 'exited',
}

// 缓存权限检查结果
const authResultCache = new Map<string, { result: boolean, timestamp: number }>();
const DEFAULT_CACHE_TTL = 60000; // 默认缓存有效期1分钟

// 日志控制函数
function routeLog(level: LogLevel, currentLevel: LogLevel, ...args: any[]) {
    if (level <= currentLevel) {
        console.info(...args);
    }
}

export const RouteGuard: FC<RouteGuardProps> = ({
    children,
    route,
    loading = <Spin size="large" className="global-loading" />,
    fallback = '/auth/login',
    authCheck,
    getUserInfo,
    onRouteChange,
    options = {},
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [transitionState, setTransitionState] = useState<RouteTransitionState>(RouteTransitionState.ENTERED);
    // 添加checkCount计数器跟踪尝试次数
    const [checkCount, setCheckCount] = useState(0);

    // 解构配置选项并设置默认值
    const {
        logLevel = LogLevel.INFO,
        enableCache = true,
        cacheTTL = DEFAULT_CACHE_TTL,
        loginPath = '/auth/login',
    } = options;

    // 缓存路由路径，避免不必要的重新渲染
    const routePath = useMemo(() => route.path || '', [route.path]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // 调试日志
                routeLog(LogLevel.INFO, logLevel, '===== RouteGuard 权限检查开始 =====');
                routeLog(LogLevel.INFO, logLevel, '当前路径:', location.pathname);
                routeLog(LogLevel.DEBUG, logLevel, '路由配置:', route);
                routeLog(LogLevel.DEBUG, logLevel, '当前检查次数:', checkCount + 1);

                // 检查是否可以使用缓存结果
                if (enableCache) {
                    const cacheKey = `${routePath}-${location.pathname}-${!!RouteUtils.isAuthenticated()}`;
                    const cachedResult = authResultCache.get(cacheKey);

                    if (cachedResult && (Date.now() - cachedResult.timestamp < cacheTTL)) {
                        routeLog(LogLevel.INFO, logLevel, '📦 使用缓存的权限检查结果:', cachedResult.result ? '通过' : '未通过');
                        setAuthorized(cachedResult.result);
                        return;
                    }
                }

                // 针对所有auth路径相关的页面直接放行，避免死循环
                if (RouteUtils.isAuthRoute(location.pathname)) {
                    routeLog(LogLevel.INFO, logLevel, '🟢 当前路径包含/auth，直接放行');
                    setAuthorized(true);
                    return;
                }

                // 根路径特殊处理，通常由客户端组件处理重定向
                if (RouteUtils.isRootPath(location.pathname)) {
                    routeLog(LogLevel.INFO, logLevel, '🟢 当前是根路径，由客户端组件处理重定向');
                    setAuthorized(true);
                    return;
                }

                // 如果路由设置了无需认证
                if (route.meta?.noAuth) {
                    routeLog(LogLevel.INFO, logLevel, '🟢 路由无需认证，直接通过');
                    setAuthorized(true);
                    return;
                }

                // 自定义权限检查
                if (authCheck) {
                    routeLog(LogLevel.INFO, logLevel, '执行自定义权限检查');
                    const result = await authCheck(route);
                    routeLog(LogLevel.INFO, logLevel, '自定义权限检查结果:', result ? '🟢 通过' : '🔴 未通过');

                    // 如果权限检查失败但这是第一次检查，再尝试一次
                    if (!result && checkCount < 2) {
                        routeLog(LogLevel.WARN, logLevel, `🔄 权限检查失败，但这是第${checkCount + 1}次检查，将在500ms后重试`);
                        setCheckCount(prev => prev + 1);
                        setTimeout(() => {
                            checkAuth();
                        }, 500);
                        return;
                    }

                    // 如果启用了缓存，将结果保存到缓存
                    if (enableCache) {
                        const cacheKey = `${routePath}-${location.pathname}-${!!RouteUtils.isAuthenticated()}`;
                        authResultCache.set(cacheKey, {
                            result,
                            timestamp: Date.now()
                        });
                        routeLog(LogLevel.DEBUG, logLevel, '📥 权限检查结果已缓存', cacheKey);
                    }

                    setAuthorized(result);
                    return;
                }

                // 默认权限检查
                if (route.meta?.permissions?.length || route.meta?.roles?.length) {
                    // 获取用户信息
                    const userInfo = getUserInfo ? await getUserInfo() : { roles: [], permissions: [] };
                    const { roles = [], permissions = [] } = userInfo;

                    routeLog(LogLevel.DEBUG, logLevel, '检查角色权限:', {
                        需要角色: route.meta.roles,
                        用户角色: roles,
                        需要权限: route.meta.permissions,
                        用户权限: permissions
                    });

                    // 检查角色权限
                    if (route.meta.roles?.length && !roles.some(role => route.meta?.roles?.includes(role))) {
                        routeLog(LogLevel.WARN, logLevel, '🔴 角色权限检查失败');
                        setAuthorized(false);
                        return;
                    }

                    // 检查操作权限
                    if (route.meta.permissions?.length && !permissions.some(permission => route.meta?.permissions?.includes(permission))) {
                        routeLog(LogLevel.WARN, logLevel, '🔴 操作权限检查失败');
                        setAuthorized(false);
                        return;
                    }
                }

                // 默认允许访问
                routeLog(LogLevel.INFO, logLevel, '🟢 权限检查通过');
                setAuthorized(true);
            } catch (error) {
                routeLog(LogLevel.ERROR, logLevel, '❌ 路由守卫检查异常:', error);
                setAuthorized(false);
            } finally {
                routeLog(LogLevel.INFO, logLevel, '===== RouteGuard 权限检查结束 =====');
            }
        };

        checkAuth();
    }, [route, authCheck, getUserInfo, checkCount, location.pathname, routePath, logLevel, enableCache, cacheTTL]);

    // 处理路由守卫钩子
    useEffect(() => {
        const handleGuard = async () => {
            if (!route.guard) return;

            const from = { path: history.state?.previousPath || '/' };
            const to = { path: location.pathname };

            // beforeEnter 钩子
            if (route.guard.beforeEnter) {
                try {
                    setTransitionState(RouteTransitionState.ENTERING);
                    const result = await route.guard.beforeEnter(to, from);

                    // 如果返回字符串，则重定向
                    if (typeof result === 'string') {
                        navigate(result);
                        return;
                    }

                    // 如果返回 false，则取消导航
                    if (result === false) {
                        navigate(-1);
                        return;
                    }

                    setTransitionState(RouteTransitionState.ENTERED);
                } catch (error) {
                    routeLog(LogLevel.ERROR, logLevel, 'beforeEnter hook error:', error);
                    navigate(-1);
                    return;
                }
            }

            // 触发路由变更事件
            onRouteChange?.(to, from);

            // afterEnter 钩子
            route.guard.afterEnter?.(to, from);

            // 保存当前路径到历史状态中，用于下一次导航
            const historyState = { ...history.state, previousPath: location.pathname };
            history.replaceState(historyState, '');
        };

        if (authorized === true) {
            handleGuard();
        }

        // 组件卸载时执行 beforeLeave 钩子
        return () => {
            if (route.guard?.beforeLeave && authorized) {
                setTransitionState(RouteTransitionState.EXITING);
                const from = { path: location.pathname };
                const to = { path: history.state?.nextPath || '/' };

                try {
                    route.guard.beforeLeave(to, from);
                    setTransitionState(RouteTransitionState.EXITED);
                } catch (error) {
                    routeLog(LogLevel.ERROR, logLevel, 'beforeLeave hook error:', error);
                }
            }
        };
    }, [authorized, location, navigate, route, onRouteChange, logLevel]);

    // 处理重定向
    if (route.redirect && authorized) {
        return <Navigate to={route.redirect} replace />;
    }

    // 根据授权状态渲染内容
    if (authorized === null) {
        return loading;
    } else if (authorized === false) {
        // 如果 fallback 是字符串，则重定向
        if (typeof fallback === 'string') {
            // 避免在登录页再次触发重定向到登录页，造成死循环
            if (location.pathname.includes(loginPath)) {
                routeLog(LogLevel.WARN, logLevel, '已在登录页，不再重定向');
                return <>{children}</>;
            }
            // 正常重定向到登录页
            routeLog(LogLevel.INFO, logLevel, '权限验证失败，重定向到:', fallback);
            return <Navigate to={fallback} state={{ from: location.pathname }} replace />;
        }

        // 否则渲染自定义的未授权组件
        return fallback || (
            <Result
                status="403"
                title="无权访问"
                subTitle="抱歉，您没有权限访问此页面"
                extra={
                    <Button type="primary" onClick={() => navigate(-1)}>
                        返回上页
                    </Button>
                }
            />
        );
    }

    // 应用路由转场动画
    const transitionStyle = {
        [RouteTransitionState.ENTERING]: { opacity: 0 },
        [RouteTransitionState.ENTERED]: { opacity: 1, transition: 'opacity 0.3s' },
        [RouteTransitionState.EXITING]: { opacity: 0, transition: 'opacity 0.3s' },
        [RouteTransitionState.EXITED]: { opacity: 0 },
    };

    return <div style={transitionStyle[transitionState]}>{children}</div>;
};

/**
 * 创建可配置的路由守卫工厂函数
 * @param options 配置选项
 * @returns 配置后的路由守卫组件
 */
export function createRouteGuard(options: RouteGuardOptions = {}): React.FC<Omit<RouteGuardProps, 'options'>> {
    return (props: Omit<RouteGuardProps, 'options'>) => (
        <RouteGuard {...props} options={options} />
    );
}

// 高阶组件用法
export function withRouteGuard<P extends object>(
    Component: React.ComponentType<P>,
    route: KyRouteConfig,
    options?: Omit<RouteGuardProps, 'children' | 'route'>
): React.FC<P> {
    return function WrappedComponent(props: P) {
        return (
            <RouteGuard route={route} {...options}>
                <Component {...props} />
            </RouteGuard>
        );
    };
} 