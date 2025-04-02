import React, { FC, ReactElement, ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { message, Spin, Result, Button } from 'antd';
import { KyRouteConfig, RouteGuard as RouteGuardType } from '../../types/route';

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
}

// 用于路由切换动画的状态
export enum RouteTransitionState {
    ENTERING = 'entering',
    ENTERED = 'entered',
    EXITING = 'exiting',
    EXITED = 'exited',
}

export const RouteGuard: FC<RouteGuardProps> = ({
    children,
    route,
    loading = <Spin size="large" className="global-loading" />,
    fallback = '/auth/login',
    authCheck,
    getUserInfo,
    onRouteChange,
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [transitionState, setTransitionState] = useState<RouteTransitionState>(RouteTransitionState.ENTERED);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // 调试日志
                console.log('RouteGuard 正在检查权限:', route.path);
                console.log('路由元数据:', route.meta);

                // 如果路由设置了无需认证
                if (route.meta?.noAuth) {
                    console.log('路由无需认证，直接通过');
                    setAuthorized(true);
                    return;
                }

                // 自定义权限检查
                if (authCheck) {
                    console.log('执行自定义权限检查');
                    const result = await authCheck(route);
                    console.log('自定义权限检查结果:', result);
                    setAuthorized(result);
                    return;
                }

                // 默认权限检查
                if (route.meta?.permissions?.length || route.meta?.roles?.length) {
                    // 获取用户信息
                    const userInfo = getUserInfo ? await getUserInfo() : { roles: [], permissions: [] };
                    const { roles = [], permissions = [] } = userInfo;

                    console.log('检查角色权限:', {
                        需要角色: route.meta.roles,
                        用户角色: roles,
                        需要权限: route.meta.permissions,
                        用户权限: permissions
                    });

                    // 检查角色权限
                    if (route.meta.roles?.length && !roles.some(role => route.meta?.roles?.includes(role))) {
                        console.log('角色权限检查失败');
                        setAuthorized(false);
                        return;
                    }

                    // 检查操作权限
                    if (route.meta.permissions?.length && !permissions.some(permission => route.meta?.permissions?.includes(permission))) {
                        console.log('操作权限检查失败');
                        setAuthorized(false);
                        return;
                    }
                }

                // 默认允许访问
                console.log('权限检查通过');
                setAuthorized(true);
            } catch (error) {
                console.error('Route guard check failed:', error);
                setAuthorized(false);
            }
        };

        checkAuth();
    }, [route, authCheck, getUserInfo]);

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
                    console.error('beforeEnter hook error:', error);
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
                    console.error('beforeLeave hook error:', error);
                }
            }
        };
    }, [authorized, location, navigate, route, onRouteChange]);

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

// 高阶组件用法
export function withRouteGuard(
    Component: React.ComponentType<any>,
    route: KyRouteConfig,
    options?: Omit<RouteGuardProps, 'children' | 'route'>
) {
    return function WrappedComponent(props: any) {
        return (
            <RouteGuard route={route} {...options}>
                <Component {...props} />
            </RouteGuard>
        );
    };
} 