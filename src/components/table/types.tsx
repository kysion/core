import { Filter, Query } from "@kysion/types";
import { IKyTableStore, KyTableColumnType } from "../../types";


/**
 * 列表操作结果
 */
export interface IKyTableActionResult {
    /**
     * 操作是否成功
     */
    success: boolean;

    /**
     * 操作类型
     */
    actionType: 'view' | 'edit' | 'delete' | 'save' | 'add';

    /**
     * 数据ID
     */
    dataId?: string | number;

    /**
     * 错误消息
     */
    errorMessage?: string;
}

export interface IListActionRef {
    /**
     * 触发保存操作
     */
    save: () => Promise<boolean>;

    /**
     * 重置
     */
    reset: () => void;
}

export interface IKyTableListActions<T> {

    /**
     * 处理视图
     */
    handleView?: (id: number) => void;

    /**
     * 处理编辑
     */
    handleEdit?: (id: number) => void;

    /**
     * 删除
     */
    deleteInfo: (dataId: number) => Promise<IKyTableActionResult>;

    /**
     * 刷新数据
     */
    refresh?: () => void;

    /**
     * 保存
     */
    saveInfo: (data: Partial<T>) => Promise<boolean>;

    /**
     * 获取信息
     */
    getInfo: (dataId: number) => Promise<T | null>;
}

export interface IMakeColumnsProps {
    columnWidths?: Record<string, number>;
    identifier: string;
    handleView?: (id: number) => void;
    handleEdit?: (id: number) => void;
}

export interface UseKyTableActionsProps<T, K extends Extract<keyof T, string> | 'operations'> {
    /**
     * 标识
     */
    identifier: string;

    /**
     * 列宽度
     */
    columnWidths?: {
        [key in K]?: number;
    } & {
        operation?: number;
    };

    /**
     * 列过滤
     */
    columnFilters?: {
        [key in K]?: Filter | ((value: any) => Filter);
    };

    /**
     * 创建表格列配置
     * @param props 
     * @param isDefault 
     * @returns 
     */
    makeColumns: (isDefault: boolean) => any[];

    /**
     * 列表操作方法
     */
    tableListActions: IKyTableListActions<T>;
}


export interface KyTableActionsRef<T, K extends Extract<keyof T, string> | 'operations'> extends IKyTableListActions<T> {
    /**
     * 获取列状态
     */
    getColumnState: () => KyTableColumnType<T, K>[];

    /**
     * 获取当前数据
     */
    getCurrentData: () => T[];
}

export interface KyTableFormProps<T> {
    /**
     * 模块名称
     */
    moduleName: string;

    /**
     * 数据ID
     */
    dataId: number;

    /**
     * 列表操作方法
     */
    tableListActions: IKyTableListActions<T>;

    /**
     * 操作模式
     */
    mode: 'view' | 'edit' | 'add';

    /**
     * 关闭回调
     */
    onClose: () => void;

    /**
     * 保存回调
     */
    onSave?: () => void;
}

/**
 * 公司管理组件属性
 */
export type KyTableManagementProps<T, K extends Extract<keyof T, string>> = {
    /**
     * 模块名称
     */
    moduleName: string;

    /**
     * 标识
     */
    identifier: string;

    /**
     * 表格 store
     */
    tableStore: IKyTableStore<T>;

    /**
     * 表格列表操作方法
     */
    tableListActions: IKyTableListActions<T>;

    /**
     * 表格列配置
     */
    tableColumns: IMakeColumnsProps;

    /**
     * 初始化回调
     */
    onInited?: (ref: () => KyTableActionsRef<T, K>) => void;

    /**
     * 初始查询参数
     */
    query?: Query;
};