import { useState, useEffect } from 'react';
import { KyTableColumnType } from '../../types/table';
import { useTableActions } from '../../store';
import { makeTableColumnOption, makeTableColumnState } from '../../components/TableSetting';
import { useTranslation } from 'react-i18next';

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
 * 增强的表格状态钩子，支持保存列设置
 * @param identifier 表格标识符
 * @param columnsWithI18n 带国际化的列配置
 * @returns 表格状态
 */
export const useTable = <T, TKeys extends string, TCustomColumn = object>(
    identifier: string,
    columnsWithI18n: (KyTableColumnType<T, TKeys> & TCustomColumn)[]
) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [tableColumnsState, setTableColumnsState] = useState<KyTableColumnType<T, TKeys>[]>([]);
    const [refresh, setRefresh] = useState(0);

    // 保存默认表格列配置的副本，用于重置
    const [defaultCustomTableColumnArr] = useState<any[]>(columnsWithI18n);

    // 直接在控制台输出初始列配置，方便调试
    console.log('初始列配置:', columnsWithI18n);

    const refreshTable = () => {
        setLoading(true);
        setTimeout(() => {
            setRefresh(refresh + 1);
            setLoading(false);
        }, 0);
    };

    // 初始化表格列配置
    useEffect(() => {
        // 从本地存储加载用户自定义的列配置
        const savedColumns = useTableActions().getTableColumnOption(identifier);
        console.log('从存储加载的自定义列配置:', savedColumns);

        // 如果有自定义配置，应用它
        if (Array.isArray(savedColumns) && savedColumns.length > 0) {
            // 创建最终的列配置，整合默认配置和自定义配置
            const result = [...columnsWithI18n];
            console.log('应用自定义列配置前:', result);

            // 应用自定义列配置
            const finalColumns = makeTableColumnState(makeTableColumnOption(result as KyTableColumnType<T, string>[], savedColumns));
            console.log('应用自定义列配置后:', finalColumns);

            // 处理侧边固定列问题
            for (const col of finalColumns) {
                // 如果列有固定属性和宽度，强制保留这些属性
                if (col.columnOptionState?.fixed) {
                    if (col.columnOptionState.fixed === 'right') {
                        col.fixed = 'right';
                    } else if (col.columnOptionState.fixed === 'left') {
                        col.fixed = 'left';
                    }

                    // 固定列必须有宽度
                    if (col.fixed && !col.width) {
                        col.width = 150;
                    }

                    console.log(`强制设置列 ${col.key || col.dataIndex} 的fixed属性为 ${col.fixed}`);
                }
            }

            // 使用类型断言解决泛型类型不匹配问题
            setTableColumnsState(finalColumns as unknown as KyTableColumnType<T, TKeys>[]);
        } else {
            // 如果没有自定义配置，使用默认配置
            console.log('没有自定义配置，使用默认配置');

            // 应用默认列配置
            const result = [...columnsWithI18n];

            // 处理默认情况下的侧边固定列问题
            for (const col of result) {
                if (col.fixed) {
                    console.log(`默认配置中列 ${col.key || col.dataIndex} 的fixed属性为 ${col.fixed}`);

                    // 确保有宽度
                    if (!col.width) {
                        col.width = 150;
                    }
                }
            }

            setTableColumnsState(result as any);
        }
    }, [identifier, refresh]);

    return {
        tableColumnsState,
        setTableColumnsState,
        loading,
        refreshTable,

        // 获取默认的列配置，用于重置
        getDefaultDataSource: () => {
            return makeTableColumnState(makeTableColumnOption(defaultCustomTableColumnArr as any, []));
        },
    };
};

export default useTable; 