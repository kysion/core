import { KyTableColumnType } from '../../types/table';
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

    return originalColumns.map(originalCol => {
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

            return updatedColumn;
        }

        // 如果没找到对应配置，返回原始列
        return originalCol;
    });
}

export default {
    handleTableChange,
    createPaginationConfig,
    createSettingDrawerConfig,
    ensureTableSortingConsistency
}; 