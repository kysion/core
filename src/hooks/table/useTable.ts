import { useState } from 'react';
import { KyTableColumnType } from '../../types/table';
import { useTableActions } from '../../store';
import { makeTableColumnOption, makeTableColumnState } from '../../components/TableSetting';

/**
 * 表格列配置选项类型
 */
export interface TableColumnOption {
    key: string;
    title: any;
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
 * 通用表格配置钩子
 * 提供表格列配置管理、页面大小设置等功能
 */
export function useTable<T = any, K extends string = string>(options: UseTableOptions<T, K>) {
    const {
        identifier,
        createColumns,
        defaultPageSize = 10,
        pageSizeOptions = ['10', '20', '30', '50', '100']
    } = options;

    const [columnStateArr, setColumnStateArr] = useState<KyTableColumnType<T, K>[]>([]);
    const { setTableColumnOption, getTableColumnOption, getTablePageSize, setTablePageSize } = useTableActions();

    /**
     * 初始化表格列配置
     * @param isDefault 是否使用默认配置
     * @returns 表格列配置
     */
    function makeColumns(isDefault: boolean = false) {
        const result = createColumns(isDefault);

        // 如果是获取默认配置，直接返回
        if (isDefault) return result;

        // 检查是否有保存的列配置
        const savedColumns = getTableColumnOption(identifier);
        if (savedColumns.length > 0 && !isDefault) {
            // 确保所有列配置都有i18nTitle字段
            const columnsWithI18n = savedColumns.map((col: any) => {
                if (!col.i18nTitle && col.title) {
                    return { ...col, i18nTitle: col.title };
                }
                return col;
            });

            return makeTableColumnState(makeTableColumnOption(result as KyTableColumnType<T, string>[], columnsWithI18n));
        }

        // 没有保存的配置，使用默认配置并保存
        const defaultCustomTableColumnArr = createColumns(true);

        // 确保所有列配置都有i18nTitle字段
        const enhancedColumns = Array.isArray(defaultCustomTableColumnArr) ?
            defaultCustomTableColumnArr.map((col: any) => {
                if (!col.i18nTitle && col.title) {
                    return { ...col, i18nTitle: col.title };
                }
                return col;
            }) :
            defaultCustomTableColumnArr;

        setTableColumnOption(
            {
                name: identifier,
                pageSize: defaultPageSize,
                columnOptionArr: enhancedColumns,
            },
            false,
        );

        return makeTableColumnState(makeTableColumnOption(result as KyTableColumnType<T, string>[], enhancedColumns as any));
    }

    /**
     * 初始化列配置
     */
    const initColumns = () => {
        setColumnStateArr(makeColumns() as KyTableColumnType<T, K>[]);
    };

    /**
     * 获取当前的页面大小
     */
    const getPageSize = () => {
        const savedPageSize = getTablePageSize(identifier);
        return savedPageSize || defaultPageSize;
    };

    /**
     * 获取页面大小选项
     */
    const getPageSizeOptions = () => {
        return pageSizeOptions;
    };

    return {
        identifier,
        columnStateArr,
        setColumnStateArr,
        makeColumns,
        initColumns,
        getPageSize,
        getPageSizeOptions,
        setTablePageSize: (pageSize: number) => setTablePageSize(identifier, pageSize)
    };
}

export default useTable; 