import React, { FC, ReactNode } from 'react';
import { Flex, Typography } from 'antd';

interface PageContainerProps {
    title?: ReactNode;
    extra?: ReactNode;
    children?: ReactNode;
    className?: string;
}

export const PageContainer: FC<PageContainerProps> = ({
    title,
    extra,
    children,
    className = ''
}) => {
    return (
        <Flex vertical gap="middle" className={`h-full ${className}`}>
            <Flex justify="space-between" align="center" className="px-2 bg-white">
                <Typography.Title level={4} className="!mb-0">
                    {title}
                </Typography.Title>
                {extra && (
                    <Flex gap="small">
                        {extra}
                    </Flex>
                )}
            </Flex>
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </Flex>
    );
}; 