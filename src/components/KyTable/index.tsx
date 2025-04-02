import React, { FC, ReactNode, useState, useEffect } from 'react';
import { Button, Flex, Table, TableProps, Tooltip } from 'antd';
import { PageContainer } from '../PageContainer';
import { KyIcon } from '../icon';
import { useTranslation } from 'react-i18next';
import { SettingTableDrawer } from '../TableSetting';
import { KyTableColumnType } from '../../types/table';
import { KyTranslate } from '../KyTranslate';
import { ensureTableSortingConsistency } from '../../hooks/table/useTableUtils';

// 用于深克隆对象，但保留函数和React组件
function deepCloneWithFunctions<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepCloneWithFunctions(item)) as unknown as T;
    }

    const clonedObj: Record<string, any> = {};
    for (const key in obj) {
        // 跳过React组件和函数的序列化
        if (typeof (obj as any)[key] === 'function') {
            clonedObj[key] = (obj as any)[key];
        }
        // 跳过React元素
        else if (React.isValidElement((obj as any)[key])) {
            clonedObj[key] = (obj as any)[key];
        }
        // 递归克隆其他对象
        else if (typeof (obj as any)[key] === 'object' && (obj as any)[key] !== null) {
            clonedObj[key] = deepCloneWithFunctions((obj as any)[key]);
        }
        // 直接复制基本类型值
        else {
            clonedObj[key] = (obj as any)[key];
        }
    }
    return clonedObj as unknown as T;
}

export interface KyTableProps<T = any> extends Omit<TableProps<T>, 'columns' | 'title'> {
    // 基础属性
    title?: ReactNode;
    identifier: string;
    extraActions?: ReactNode[];

    // 列配置
    columns: KyTableColumnType<T, any>[];
    onColumnsChange?: (columns: KyTableColumnType<T, any>[]) => void;

    // 表格设置
    settingDrawer?: {
        visible?: boolean;
        onVisibleChange?: (visible: boolean) => void;
        getDefaultDataSource?: () => any[];
    };

    // 刷新功能
    onRefresh?: () => void;
    refreshLoading?: boolean;

    // 样式
    className?: string;
}

/**
 * 增强的表格组件
 * 提供表格显示、刷新和列设置功能
 */
export const KyTable: FC<KyTableProps> = ({
    // 解构基础属性
    title,
    identifier,
    extraActions = [],

    // 解构列配置
    columns: propColumns,
    onColumnsChange,

    // 解构表格设置
    settingDrawer,

    // 解构刷新功能
    onRefresh,
    refreshLoading,

    // 解构样式
    className,

    // 其他 Table 属性
    ...tableProps
}) => {
    const { t } = useTranslation();
    const [settingVisible, setSettingVisible] = useState(false);
    // 添加内部排序状态跟踪
    const [internalSortState, setInternalSortState] = useState<{
        key?: string | number;
        order?: 'ascend' | 'descend';
    }>({});

    // 为所有列创建默认的key值
    useEffect(() => {
        propColumns.forEach((col, index) => {
            if (!col.key) {
                if (typeof col.dataIndex === 'string') {
                    col.key = col.dataIndex;
                } else {
                    col.key = `col-${index}`;
                }
            }
        });
    }, [propColumns]);

    // 增强表格的onChange处理，捕获排序变化
    const handleTableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        // 保存最新的排序状态
        if (sorter) {
            // 处理单列排序
            if (!Array.isArray(sorter)) {
                if (sorter.columnKey || sorter.field) {
                    setInternalSortState({
                        key: sorter.columnKey || sorter.field,
                        order: sorter.order
                    });
                } else {
                    setInternalSortState({});
                }
            }
            // 处理多列排序
            else if (Array.isArray(sorter) && sorter.length > 0) {
                // 仅使用第一个排序项
                const firstSorter = sorter[0];
                if (firstSorter.columnKey || firstSorter.field) {
                    setInternalSortState({
                        key: firstSorter.columnKey || firstSorter.field,
                        order: firstSorter.order
                    });
                }
            }
        }

        // 调用原有的onChange处理
        tableProps.onChange?.(pagination, filters, sorter, extra);
    };

    // 处理列变化
    const handleColumnsChange = (data: any[]) => {
        if (onColumnsChange) {
            // 打印调试信息
            console.log('列配置更新前:', propColumns);
            console.log('列配置更新后原始数据:', data);
            console.log('当前排序状态:', internalSortState);

            // 使用辅助函数确保列配置更新后排序功能保持一致
            const updatedColumns = ensureTableSortingConsistency(propColumns, data);

            // 确保应用当前排序状态
            if (internalSortState.key) {
                updatedColumns.forEach(col => {
                    const colKey = col.key || col.dataIndex;
                    if (colKey === internalSortState.key) {
                        col.sortOrder = internalSortState.order;
                        if (col.sorter !== false) {
                            col.sorter = true;
                        }
                    } else if (col.sortOrder) {
                        // 清除其他列的排序状态
                        col.sortOrder = undefined;
                    }
                });
            }

            console.log('列配置更新后处理数据:', updatedColumns);

            // 调用回调函数，传递更新后的列配置
            onColumnsChange(updatedColumns);
        }
    };

    // 修改处理方式：不直接过滤掉隐藏的列，而是通过CSS隐藏它们
    // 创建一个保留所有排序功能的列数组
    const allColumns = [...propColumns];

    // 创建一个用于显示的列数组，处理隐藏列
    const processedColumns = allColumns.map((col: any) => {
        // 创建列的副本，使用深拷贝避免引用问题
        const newCol = deepCloneWithFunctions(col);

        const title = col.title as any;

        // 处理标题
        let processedTitle = title;
        if (!title) {
            // 处理title为undefined的情况
            processedTitle = '';
            console.warn('列标题为undefined：', col);
        } else if (typeof title === 'string') {
            processedTitle = title;
        } else if (title?.props?.localeKey) {
            processedTitle = <KyTranslate localeKey={title.props.localeKey} />;
        }

        newCol.title = processedTitle;
        newCol.width = col.fixed && !col.width ? 150 : col.width;

        // 关键修改：不删除隐藏列，而是设置特殊样式来隐藏它
        if (col.hidden) {
            // 使用onCell来添加样式以隐藏列
            const originalOnCell = newCol.onCell || (() => ({}));
            newCol.onCell = (record: any, rowIndex: number) => {
                const originalProps = typeof originalOnCell === 'function'
                    ? originalOnCell(record, rowIndex)
                    : originalOnCell;
                return {
                    ...originalProps,
                    style: {
                        ...((originalProps as any)?.style || {}),
                        display: 'none',
                    }
                };
            };

            // 设置表头单元格样式来隐藏列
            const originalOnHeaderCell = newCol.onHeaderCell || (() => ({}));
            newCol.onHeaderCell = () => {
                const originalProps = typeof originalOnHeaderCell === 'function'
                    ? originalOnHeaderCell()
                    : originalOnHeaderCell;
                return {
                    ...originalProps,
                    style: {
                        ...((originalProps as any)?.style || {}),
                        display: 'none',
                    }
                };
            };

            // 仍然设置宽度为0以不占用空间，但保留其他属性
            newCol.width = 0;
        }

        return newCol;
    });

    // 构建操作按钮
    const actionButtons = [
        // 刷新按钮
        onRefresh && (
            <Tooltip key="refresh" title={t('kysion.common.refresh.tooltip')} placement="bottom">
                <Button
                    color="primary"
                    variant="filled"
                    className="ml-8px"
                    loading={refreshLoading}
                    icon={<KyIcon fontSize={16} icon="bitcoin-icons:refresh-filled" />}
                    onClick={onRefresh}
                />
            </Tooltip>
        ),
        // 设置按钮
        settingDrawer && (
            <Tooltip key="setting" title={t('kysion.table.column.setting.title')} placement="bottom">
                <Button
                    color="primary"
                    variant="filled"
                    className="ml-8px"
                    icon={<KyIcon fontSize={16} icon="ant-design:setting-outlined" />}
                    onClick={() => setSettingVisible(true)}
                />
            </Tooltip>
        ),
        // 添加自定义的额外操作按钮
        ...extraActions,
    ].filter(Boolean);

    return (
        <PageContainer
            title={title}
            extra={actionButtons}
            className={className}
        >
            <Flex vertical className="relative size-full flex">
                <Table
                    locale={{
                        filterConfirm: t('common.confirm'),
                        filterReset: t('common.reset')
                    }}
                    {...tableProps}
                    size="small"
                    bordered
                    className="relative size-full"
                    rowKey={(record) => {
                        return (record as any).id || (record as any).key || (record as any).index || JSON.stringify(record);
                    }}
                    columns={processedColumns}
                    onChange={handleTableChange}
                    pagination={tableProps.pagination ? {
                        ...tableProps.pagination,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '30', '50', '100'],
                        showTotal: (total, range) => {
                            return t('kysion.table.pagination.showTotal', {
                                total,
                                begin: range[0],
                                end: range[1]
                            });
                        }
                    } : false}
                    scroll={{
                        x: processedColumns
                            .filter((item) => item.width)
                            .map((item) => {
                                if (typeof item.width === 'number') return item.width;
                                if (typeof item.width === 'string') return Number.parseInt(item.width, 10) ?? 100;
                                return 80;
                            })
                            .reduce((a, b) => a + b, 0),
                    }}
                />
                {settingDrawer && (
                    <SettingTableDrawer
                        identifier={identifier}
                        title={t('kysion.table.column.setting.title')}
                        autoOpen={settingVisible}
                        getDefaultDataSource={settingDrawer.getDefaultDataSource}
                        onChange={handleColumnsChange}
                        onClose={() => {
                            setSettingVisible(false);
                            settingDrawer.onVisibleChange?.(false);
                        }}
                    />
                )}
            </Flex>
        </PageContainer>
    );
}; 