import { NotificationInstance } from 'antd/es/notification/interface';
import { MessageInstance } from 'antd/es/message/interface';
import { ReactNode } from 'react';

/**
 * 层级内容项接口
 */
export interface LayerContentItem {
    /**
     * 渲染的内容
     */
    child: ReactNode;

    /**
     * 唯一标识符
     */
    identifier?: React.Key;

    /**
     * 层级顺序，值越大越靠前
     */
    zIndex?: number;

    /**
     * 关闭回调
     */
    onClose?: () => void;
}

/**
 * 层级内容上下文类型
 */
export interface LayerContentContextType {
    /**
     * 显示内容
     * @param content 要显示的内容配置
     * @returns 内容的唯一标识符
     */
    showContent: (content: Omit<LayerContentItem, 'identifier'> & { identifier?: React.Key }) => React.Key;

    /**
     * 隐藏内容
     * @param identifier 内容的唯一标识符
     */
    hideContent: (identifier: React.Key) => void;

    /**
     * 更新内容
     * @param identifier 内容的唯一标识符
     * @param content 要更新的内容配置
     */
    updateContent: (identifier: React.Key, content: Partial<LayerContentItem>) => void;

    /**
     * 当前显示的所有内容
     */
    contents: LayerContentItem[];
}

/**
 * 抽屉配置选项
 */
export interface DrawerOptions {
    /**
     * 标题
     */
    title: string;

    /**
     * 内容
     * 可以是ReactNode或返回ReactNode的函数
     * 如果是函数，会传入close方法，方便内容内部关闭抽屉
     */
    content: ReactNode | ((close: () => void) => ReactNode);

    /**
     * 关闭回调
     */
    onClose?: () => void;

    /**
     * 宽度
     * @default 500
     */
    width?: number | string;

    /**
     * 高度
     */
    height?: number | string;

    /**
     * 位置
     * @default 'right'
     */
    placement?: 'left' | 'right' | 'top' | 'bottom';

    /**
     * 唯一标识符
     * 如果不提供，会自动生成
     */
    identifier?: React.Key;

    /**
     * 层级
     * @default 1000
     */
    zIndex?: number;

    /**
     * 点击蒙层是否允许关闭
     * @default false
     */
    maskClosable?: boolean;

    /**
     * 抽屉标题栏右侧的额外内容
     */
    extra?: React.ReactNode;

    /**
     * 自定义抽屉样式
     */
    styles?: {
        header?: React.CSSProperties;
        body?: React.CSSProperties;
        footer?: React.CSSProperties;
        mask?: React.CSSProperties;
        wrapper?: React.CSSProperties;
        content?: React.CSSProperties;
    };
}

/**
 * 模态框选项
 */
export interface ModalOptions {
    /**
     * 唯一标识符
     */
    identifier?: string;

    /**
     * 标题
     */
    title: string;

    /**
     * 宽度
     */
    width?: number | string;

    /**
     * 内容，可以是 React 节点或返回 React 节点的函数
     */
    content: React.ReactNode | ((close: () => void) => React.ReactNode);

    /**
     * 确认按钮点击回调
     */
    onOk?: () => Promise<void> | void;

    /**
     * 取消按钮点击回调
     */
    onCancel?: () => void;

    /**
     * z-index
     */
    zIndex?: number;

    /**
     * 点击蒙层是否允许关闭
     * @default false
     */
    maskClosable?: boolean;

    /**
     * 是否显示确认按钮
     */
    showOkButton?: boolean;

    /**
     * 是否显示取消按钮
     */
    showCancelButton?: boolean;

    /**
     * 自定义样式
     */
    styles?: {
        header?: React.CSSProperties;
        body?: React.CSSProperties;
        footer?: React.CSSProperties;
        mask?: React.CSSProperties;
        wrapper?: React.CSSProperties;
        content?: React.CSSProperties;
    };

    /**
     * 自定义页脚内容
     */
    footer?: React.ReactNode | null;

    /**
     * 确认按钮文本
     */
    okText?: string;

    /**
     * 取消按钮文本
     */
    cancelText?: string;
}

/**
 * 全局Modal方法
 */
export interface GlobalModalMethods {
    /**
     * 显示模态框
     */
    show: (options: ModalOptions) => React.Key;
}

/**
 * 全局Drawer方法
 */
export interface GlobalDrawerMethods {
    /**
     * 显示抽屉
     */
    show: (options: DrawerOptions) => React.Key;
}

/**
 * 旧版API兼容方法类型
 */
export type SetTopLayerContentFunction = (child: ReactNode | null | undefined, identifier?: React.Key) => void;

// 扩展全局Window接口
declare global {
    interface Window {
        $setTopLayerContent?: SetTopLayerContentFunction;
        $notification?: NotificationInstance;
        $message?: MessageInstance;
        $modal?: GlobalModalMethods;
        $drawer?: GlobalDrawerMethods;
    }
} 