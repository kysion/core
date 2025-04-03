import { useState, useEffect } from 'react';
import { KyTableColumnType } from '../../types/table';
import { useTableActions } from '../../store';
import { makeTableColumnOption, makeTableColumnState } from '../../components/KyList/setting';

/**
 * 表格列配置选项类型
 */
export interface TableColumnSettings {
    key: string;
    title: any;
    source?: 'local' | 'remote' | 'default';
    [key: string]: any;
}

/**
 * 通用表格配置钩子参数
 */
export interface UseTableOptions<T = any, K extends string = string> {
    /**
     * 唯一标识符，用于持久化表格配置
     */
    identifier: string;

    /**
     * 默认列配置生成函数
     */
    createColumns: (isDefault?: boolean) => KyTableColumnType<T, K>[] | any[];

    /**
     * 默认页面大小
     */
    defaultPageSize?: number;

    /**
     * 页面大小选项
     */
    pageSizeOptions?: string[];
}

/**
 * 增强的表格状态钩子，支持保存列设置
 * @param identifier 表格标识符
 * @param columnsWithI18n 带国际化的列配置
 * @returns 表格状态
 */
export const useTable = <T, TKeys extends string, TCustomColumn = object>(
    identifier: string,
    columnsWithI18n: (KyTableColumnType<T, TKeys> & TCustomColumn)[]
): {
    tableColumnsState: KyTableColumnType<T, TKeys>[];
    setTableColumnsState: React.Dispatch<React.SetStateAction<KyTableColumnType<T, TKeys>[]>>;
    loading: boolean;
    refreshTable: () => void;
    getDefaultDataSource: () => KyTableColumnType<T, TKeys>[];
} => {
    const [loading, setLoading] = useState(false);
    const [tableColumnsState, setTableColumnsState] = useState<KyTableColumnType<T, TKeys>[]>([]);
    const [refresh, setRefresh] = useState(0);
    const tableActions = useTableActions();

    // 规范化表格标识符
    const normalizedIdentifier = identifier.replace(/_column_conf$/, '');
    const standardIdentifier = `${normalizedIdentifier}_column_conf`;

    // 保存默认表格列配置的副本，用于重置
    const [defaultCustomTableColumnArr] = useState<any[]>(columnsWithI18n);

    const refreshTable = () => {
        setLoading(true);
        setTimeout(() => {
            setRefresh(refresh + 1);
            setLoading(false);
        }, 0);
    };

    // 初始化表格列配置
    useEffect(() => {
        const initTable = async () => {
            setLoading(true);

            // 创建默认配置对象
            const defaultConfig = {
                name: standardIdentifier,
                columnOptionArr: makeTableColumnOption(columnsWithI18n as any, []).map(col => ({
                    ...col.columnOptionState,
                    title: col.title,
                    conf: col.columnOption,
                    sort: col.columnSort || 0,
                    key: col.key || col.dataIndex
                })),
                pageSize: 20
            };

            const configApplied = tableActions.getTableConfig(standardIdentifier, defaultConfig);

            setTableColumnsState(configApplied?.columnOptionArr as any);

            setLoading(false);

        };

        initTable();
    }, [standardIdentifier, refresh]);

    return {
        tableColumnsState,
        setTableColumnsState,
        loading,
        refreshTable,

        // 获取默认的列配置，用于重置
        getDefaultDataSource: () => {
            const defaultColumns = makeTableColumnState(makeTableColumnOption(defaultCustomTableColumnArr as any, []));
            return defaultColumns as unknown as KyTableColumnType<T, TKeys>[];
        },
    };
};

export default useTable; 