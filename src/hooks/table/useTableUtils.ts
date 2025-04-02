import { KyTableColumnType, fixedStateSet } from '../../types/table';
import { TableOnChangeFunc } from '../../components/TableSetting';

/**
 * 表格变更参数类型
 */
export interface TableChangeParams<T = any, K extends string = string> {
    /**
     * 分页信息
     */
    pagination: any;

    /**
     * 过滤信息
     */
    filters: any;

    /**
     * 排序信息
     */
    sorter: any;

    /**
     * 额外信息
     */
    extra: any;

    /**
     * 列数据
     */
    dataColumnStateArr: KyTableColumnType<T, K>[];

    /**
     * 处理更新查询参数的方法
     */
    setQueryParams: (params: any) => void;

    /**
     * 设置页面大小的方法
     */
    setTablePageSize: (pageSize: number) => void;

    /**
     * 获取数据的方法
     */
    fetchList: (params: any) => void;
}

/**
 * 处理表格变更的通用函数
 * 统一处理表格分页、过滤、排序等变更事件
 */
export function handleTableChange<T = any, K extends string = string>({
    pagination,
    filters,
    sorter,
    extra,
    dataColumnStateArr,
    setQueryParams,
    setTablePageSize,
    fetchList
}: TableChangeParams<T, K>) {
    // 使用TableOnChangeFunc处理表格变更
    const query = TableOnChangeFunc({
        pagination,
        filters,
        sorter,
        extra,
        dataColumnStateArr,
    });

    // 更新页面大小设置
    setTablePageSize(pagination.pageSize ?? 10);

    // 更新查询参数
    setQueryParams({
        ...query,
        pageNum: pagination.current ?? 1,
        pageSize: pagination.pageSize ?? 10,
    });

    // 获取数据
    fetchList(query);
}

/**
 * 创建表格分页配置的通用函数
 */
export function createPaginationConfig(
    t: (key: string, data?: any) => string,
    tableParams: any,
    dataArr: any,
    getPageSize: () => number,
    getPageSizeOptions: () => string[]
) {
    return {
        current: tableParams.pagination?.current ?? 1,
        pageSize: tableParams.pagination?.pageSize ?? getPageSize(),
        pageSizeOptions: getPageSizeOptions(),
        showSizeChanger: true,
        total: dataArr.total,
        showTotal: (total: number, range: [number, number]) => {
            return t('kysion.table.pagination.showTotal', {
                total,
                begin: range[0],
                end: range[1]
            });
        },
    };
}

/**
 * 创建表格设置抽屉配置的通用函数
 */
export function createSettingDrawerConfig(
    visible: boolean,
    onVisibleChange: (visible: boolean) => void,
    getDefaultDataSource?: () => any[]
) {
    return {
        visible,
        onVisibleChange,
        getDefaultDataSource: getDefaultDataSource || (() => []),
    };
}

/**
 * 确保列配置更新后排序功能保持一致
 * 在处理列配置变更时使用此函数
 */
export function ensureTableSortingConsistency<T = any, K extends string = string>(
    originalColumns: KyTableColumnType<T, K>[],
    updatedColumnsConfig: any[]
): KyTableColumnType<T, K>[] {
    // 记录原始列配置中的排序状态
    const originalSortState = originalColumns.find(col => col.sortOrder);

    // 先处理排序和更新基本属性
    const columnsWithUpdates = originalColumns.map(originalCol => {
        // 查找对应的新配置
        const newColConfig = updatedColumnsConfig.find(item =>
            (item.key === originalCol.key) ||
            (item.dataIndex === originalCol.dataIndex));

        if (newColConfig) {
            // 创建新列配置的基础结构
            const updatedColumn = {
                ...originalCol,
                // 更新列选项状态
                columnOptionState: {
                    ...originalCol.columnOptionState,
                    ...newColConfig,
                },
                // 更新隐藏状态
                hidden: newColConfig.hidden === true,
            } as KyTableColumnType<T, K>;

            // 处理排序状态 - 优先保留原有排序
            if (originalCol.sortOrder) {
                // 保留原列的排序状态
                updatedColumn.sorter = originalCol.sorter;
                updatedColumn.sortOrder = originalCol.sortOrder;
            } else if (newColConfig.sortBy !== undefined) {
                // 如果原列没有排序状态，检查新配置中是否有排序信息
                if (newColConfig.sortBy === 'asc') {
                    updatedColumn.sortOrder = 'ascend';
                    updatedColumn.sorter = true;
                } else if (newColConfig.sortBy === 'desc') {
                    updatedColumn.sortOrder = 'descend';
                    updatedColumn.sorter = true;
                } else {
                    updatedColumn.sortOrder = undefined;
                    // 保留sorter原有设置，只是不应用排序顺序
                }
            }

            // 只进行基本设置，后面会用applyColumnFixed统一处理fixed属性
            return updatedColumn;
        }

        // 如果没找到对应配置，返回原始列
        return originalCol;
    });

    // 然后统一应用fixed属性
    const finalColumns = columnsWithUpdates.map(col => applyColumnFixed(col));

    return finalColumns;
}

export function convertFixedStateToString(fixedValue: any): 'left' | 'right' | undefined {
    // 空值处理
    if (fixedValue === null || fixedValue === undefined || fixedValue === '') {
        return undefined;
    }

    // 直接是字符串"left"或"right"
    if (fixedValue === 'left' || fixedValue === 'right') {
        return fixedValue;
    }

    // 是枚举值
    if (fixedValue === fixedStateSet.Left) {
        return 'left';
    }
    if (fixedValue === fixedStateSet.Right) {
        return 'right';
    }
    if (fixedValue === fixedStateSet.None) {
        return undefined;
    }

    // 是字符串但大小写不同
    if (typeof fixedValue === 'string') {
        const lowerValue = fixedValue.toLowerCase();
        if (lowerValue === 'left') {
            return 'left';
        }
        if (lowerValue === 'right') {
            return 'right';
        }
        if (lowerValue === 'none') {
            return undefined;
        }
    }

    // 是对象且有可能包含信息
    if (typeof fixedValue === 'object' && fixedValue !== null) {
        // 检查对象是否有指示fixed的属性
        if ('fixed' in fixedValue) {
            return convertFixedStateToString(fixedValue.fixed);
        }
        if ('type' in fixedValue && typeof fixedValue.type === 'string') {
            return convertFixedStateToString(fixedValue.type);
        }
    }

    return undefined;
}

/**
 * 强制应用固定列设置
 * 在调用此函数之前已经确认了表格列的fixed属性但未生效时使用
 */
export function forceApplyFixedColumns<T = any, K extends string = string>(
    columns: KyTableColumnType<T, K>[]
): KyTableColumnType<T, K>[] {
    // 克隆列，避免修改原始对象
    const fixedColumns = [...columns];

    // 遍历所有列，检查并应用fixed属性
    for (const col of fixedColumns) {
        // 先检查列自身的fixed属性
        if (col.fixed) {
            // 使用辅助函数转换fixed值，以确保格式正确
            const convertedFixed = convertFixedStateToString(col.fixed);
            if (convertedFixed) {
                col.fixed = convertedFixed;
                // 确保固定列有宽度
                if (!col.width || (typeof col.width === 'number' && col.width < 100)) {
                    col.width = 150;
                }
            }
        }
        // 检查columnOptionState中的fixed属性
        else if (col.columnOptionState?.fixed) {
            // 使用辅助函数转换fixed值
            const convertedFixed = convertFixedStateToString(col.columnOptionState.fixed);
            if (convertedFixed) {
                col.fixed = convertedFixed;
                // 确保固定列有宽度
                if (!col.width || (typeof col.width === 'number' && col.width < 100)) {
                    col.width = 150;
                }
            }
        }
    }

    return fixedColumns;
}

/**
 * 清除表格配置缓存
 * 当表格配置出现问题需要重置时使用
 */
export function clearTableConfig(identifier: string): boolean {
    try {
        // 清除localStorage中的表格配置项
        const storageKey = `tableColumnOption_${identifier}`;
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(storageKey);
            console.log(`已清除表格配置缓存: ${storageKey}`);
            return true;
        }
        return false;
    } catch (err) {
        console.error('清除表格配置缓存失败:', err);
        return false;
    }
}

/**
 * 清除所有表格配置缓存
 * 当表格配置出现严重问题时使用
 */
export function clearAllTableConfig(): boolean {
    try {
        if (typeof localStorage !== 'undefined') {
            // 查找所有与表格配置相关的键
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('tableColumnOption_')) {
                    keysToRemove.push(key);
                }
            }

            // 删除所有相关键
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`已清除表格配置缓存: ${key}`);
            });

            return keysToRemove.length > 0;
        }
        return false;
    } catch (err) {
        console.error('清除所有表格配置缓存失败:', err);
        return false;
    }
}

/**
 * 直接为表格列设置正确的fixed属性
 * 此函数用于解决列设置中fixed属性不生效的问题
 */
export function applyColumnFixed<T = any, K extends string = string>(
    column: KyTableColumnType<T, K>
): KyTableColumnType<T, K> {
    // 创建列的副本，避免修改原始对象
    const newColumn = { ...column };

    // 检查列的fixed设置
    if (newColumn.columnOptionState?.fixed) {
        // 1. 从columnOptionState中获取fixed值
        const fixedValue = newColumn.columnOptionState.fixed;

        // 2. 根据fixed值设置列的fixed属性
        if (String(fixedValue) === 'right' || String(fixedValue) === String(fixedStateSet.Right)) {
            // 参考操作列的实现方式，直接设置fixed属性
            newColumn.fixed = 'right';
        } else if (String(fixedValue) === 'left' || String(fixedValue) === String(fixedStateSet.Left)) {
            newColumn.fixed = 'left';
        } else {
            newColumn.fixed = undefined;
        }

        // 3. 如果是fixed列，确保有足够宽度
        if (newColumn.fixed) {
            if (!newColumn.width || (typeof newColumn.width === 'number' && newColumn.width < 120)) {
                // 设置足够的宽度，与操作列保持一致
                newColumn.width = 150;
            }
        }
    }

    // 4. 特殊处理：如果是操作列，总是固定在右侧
    if (newColumn.key === 'operation') {
        newColumn.fixed = 'right';
        if (!newColumn.width || (typeof newColumn.width === 'number' && newColumn.width < 150)) {
            newColumn.width = 200;
        }
    }

    // 5. 特殊处理：如果是用户名列，确保固定属性与操作列一致
    if (
        newColumn.key === 'username' ||
        newColumn.dataIndex === 'username' ||
        (typeof newColumn.title === 'string' && newColumn.title.includes('用户名'))
    ) {
        // 如果设置为右侧固定但没有生效，强制应用
        if (newColumn.columnOptionState?.fixed === 'right' || String(newColumn.columnOptionState?.fixed) === 'right') {
            newColumn.fixed = 'right';

            // 确保有足够宽度
            if (!newColumn.width || (typeof newColumn.width === 'number' && newColumn.width < 120)) {
                newColumn.width = 150;
            }
        }
    }

    return newColumn;
}

export default {
    handleTableChange,
    createPaginationConfig,
    createSettingDrawerConfig,
    ensureTableSortingConsistency,
    forceApplyFixedColumns,
    clearTableConfig,
    clearAllTableConfig,
    applyColumnFixed
}; 