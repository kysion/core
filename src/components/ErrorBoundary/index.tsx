import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result, Typography } from 'antd';
import { WarningOutlined, ReloadOutlined, RollbackOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

export interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    errorComponent?: React.ComponentType<{ error: Error; reset: () => void }>;
    showDetails?: boolean;
    onReset?: () => void;
    onBack?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Route Error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleReset = (): void => {
        this.props.onReset?.();
        this.setState({ hasError: false, error: null });
    };

    handleBack = (): void => {
        this.props.onBack?.();
        if (window.history && window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    };

    render(): ReactNode {
        const { hasError, error } = this.state;
        const { children, fallback, errorComponent: ErrorComponent, showDetails = false } = this.props;

        if (hasError) {
            if (ErrorComponent && error) {
                return <ErrorComponent error={error} reset={this.handleReset} />;
            }

            if (fallback) {
                return fallback;
            }

            // 默认错误UI
            return (
                <Result
                    status="error"
                    title="页面出错了"
                    subTitle="很抱歉，当前页面遇到了一些问题。"
                    icon={<WarningOutlined />}
                    extra={[
                        <Button key="back" icon={<RollbackOutlined />} onClick={this.handleBack}>
                            返回上页
                        </Button>,
                        <Button key="refresh" type="primary" icon={<ReloadOutlined />} onClick={this.handleReset}>
                            重新加载
                        </Button>,
                    ]}
                >
                    {showDetails && error && (
                        <div style={{ marginTop: 24, textAlign: 'left' }}>
                            <Paragraph>
                                <Text strong>错误详情:</Text>
                            </Paragraph>
                            <Paragraph>
                                <pre style={{
                                    padding: 16,
                                    background: 'rgba(0,0,0,0.05)',
                                    borderRadius: 4,
                                    maxHeight: '200px',
                                    overflow: 'auto'
                                }}>
                                    {error.stack || error.message}
                                </pre>
                            </Paragraph>
                        </div>
                    )}
                </Result>
            );
        }

        return children;
    }
}

// 高阶组件包装
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    options?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
    const WithErrorBoundary: React.FC<P> = (props) => (
        <ErrorBoundary {...options}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WithErrorBoundary.displayName = `WithErrorBoundary(${getDisplayName(Component)})`;
    return WithErrorBoundary;
}

function getDisplayName<P extends object>(Component: React.ComponentType<P>): string {
    return Component.displayName || Component.name || 'Component';
} 