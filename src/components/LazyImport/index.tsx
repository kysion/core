import { ComponentType, FC, LazyExoticComponent, ReactNode, Suspense } from 'react'
import { Col, Row, Spin } from 'antd'
import React from 'react'

const LazyLoading = () => {
    return (
        <Row align="middle" justify="center" style={{ minHeight: '100%' }}>
            <Col>
                <Spin spinning />
            </Col>
        </Row>
    )
}

interface LazyImportProps {
    lazy?: LazyExoticComponent<ComponentType>
    element?: ReactNode
    children?: ReactNode
    fallback?: ReactNode
    prefetch?: boolean
}

export type LazyComponent = LazyExoticComponent<ComponentType>

export const LazyImport: FC<LazyImportProps> = ({ lazy, element, children, fallback = <LazyLoading />, prefetch }) => {
    const Component = lazy ? lazy : () => null

    React.useEffect(() => {
        if (prefetch && lazy && typeof lazy === 'object') {
            const lazyInitializer = Object.getOwnPropertyDescriptor(lazy, '_init')?.value;
            if (typeof lazyInitializer === 'function') {
                lazyInitializer();
            }
        }
    }, [lazy, prefetch]);

    return (
        <Suspense fallback={fallback}>
            {element ? element : children ? children : <Component />}
        </Suspense>
    )
}

LazyImport.displayName = 'LazyImport';