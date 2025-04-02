import React, { FC, ReactNode, useState, useEffect } from 'react';
import { Button, Flex, Table, TableProps, Tooltip } from 'antd';
import { PageContainer } from '../PageContainer';
import { KyIcon } from '../icon';
import { useTranslation } from 'react-i18next';
import { SettingTableDrawer } from '../TableSetting';
import { KyTableColumnType, fixedStateSet } from '../../types/table';
import { KyTranslate } from '../KyTranslate';
import { ensureTableSortingConsistency, forceApplyFixedColumns, applyColumnFixed } from '../../hooks/table/useTableUtils';

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

            // 调用回调函数，传递更新后的列配置
            onColumnsChange(updatedColumns);
        }
    };

    // 打印所有列的fixed状态
    console.log('KyTable所有列状态:',
        propColumns.map(col => ({
            key: col.key || col.dataIndex,
            title: col.title,
            fixed: col.fixed,
            hidden: col.hidden,
            columnOptionState: col.columnOptionState
        }))
    );

    // 创建一个保留所有排序功能的列数组，同时修复fixed属性
    const allColumns = forceApplyFixedColumns([...propColumns]);

    // 创建一个用于显示的列数组，处理隐藏列，同时强制应用fixed属性
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

        // ======= FIXED 属性的处理 =======
        // 使用applyColumnFixed函数统一处理fixed属性
        const fixedCol = applyColumnFixed(newCol);

        // ======= 隐藏列处理 =======
        if (col.hidden) {
            // 使用onCell来添加样式以隐藏列
            const originalOnCell = fixedCol.onCell || (() => ({}));
            fixedCol.onCell = ((record: any, index?: number) => {
                const originalProps = typeof originalOnCell === 'function'
                    ? originalOnCell(record, index)
                    : originalOnCell;
                return {
                    ...originalProps,
                    style: {
                        ...((originalProps as any)?.style || {}),
                        display: 'none',
                    }
                };
            }) as any;

            // 设置表头单元格样式来隐藏列
            const originalOnHeaderCell = fixedCol.onHeaderCell || (() => ({}));
            fixedCol.onHeaderCell = ((column: any) => {
                const originalProps = typeof originalOnHeaderCell === 'function'
                    ? originalOnHeaderCell(column)
                    : originalOnHeaderCell;
                return {
                    ...originalProps,
                    style: {
                        ...((originalProps as any)?.style || {}),
                        display: 'none',
                    }
                };
            }) as any;

            // 即使隐藏列也保留fixed属性，只设置宽度为0
            fixedCol.width = 0;
        }

        return fixedCol;
    });

    // 监听fixed属性变化的自定义事件
    useEffect(() => {
        const handleFixedChange = (event: any) => {
            if (onColumnsChange) {
                console.log('收到fixed属性变化事件:', event.detail);
                // 创建新的列设置
                const updatedColumns = forceApplyFixedColumns([...propColumns]);

                // 应用新的列设置
                onColumnsChange(updatedColumns);
            }
        };

        // 添加事件监听
        window.addEventListener('kysion:table:fixed-changed', handleFixedChange);

        // 组件卸载时移除事件监听
        return () => {
            window.removeEventListener('kysion:table:fixed-changed', handleFixedChange);
        };
    }, [propColumns, onColumnsChange]);

    // 组件首次加载或identifier变更时，清除缓存并重新初始化
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.search.includes('clearCache=true')) {
            import('../../hooks/table/useTableUtils').then(({ clearTableConfig }) => {
                const cleared = clearTableConfig(identifier);
                if (cleared) {
                    console.log(`已自动清除表格配置缓存: ${identifier}`);
                    // 刷新页面以应用新配置
                    window.location.href = window.location.href.split('?')[0];
                }
            });
        }
    }, [identifier]);

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

    // 创建一个保留所有排序功能的列数组，同时修复fixed属性
    const columns = allColumns.map((col: any) => {
        return applyColumnFixed(col);
    });

    // 计算表格的scroll属性
    const tableScrollProps = {
        // 确保x值足够大以触发横向滚动条，这是固定列显示的必要条件
        x: Math.max(
            // 计算所有列宽度总和
            columns
                .filter(item => !item.hidden)
                .map(item => {
                    if (typeof item.width === 'number') return item.width;
                    if (typeof item.width === 'string') return Number.parseInt(item.width, 10) || 100;
                    return 100; // 未设置宽度的列默认100px
                })
                .reduce((a, b) => a + b, 0),
            // 设置一个较大的最小值，确保出现横向滚动条
            1200
        ),
        // 设置垂直方向的滚动区域，确保表格不会过高
        y: 500
    };

    // 对所有列最后的处理，特别关注用户名列
    const finalColumns = columns.map(col => {
        // 已处理过的列，直接返回
        if (col.key !== 'username' && col.dataIndex !== 'username') {
            return col;
        }

        // 特殊处理用户名列，确保其固定属性与操作列一样能生效
        if (col.columnOptionState?.fixed === 'right' || String(col.columnOptionState?.fixed) === 'right') {
            col.fixed = 'right';
            // 确保有足够宽度
            if (!col.width || +col.width < 150) {
                col.width = 150;
            }
        }

        return col;
    });

    return (
        <PageContainer
            title={title}
            extra={actionButtons}
            className={className}
        >
            <Flex vertical className="relative size-full flex">
                {/* 
                    关键修复：创建一个隐藏的div元素，确保水平滚动的最小宽度足够触发滚动
                    这样fixed列才能正常工作 
                */}
                <div style={{
                    position: 'absolute',
                    width: '2000px',
                    height: '1px',
                    opacity: 0,
                    pointerEvents: 'none',
                    visibility: 'hidden'
                }} />

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
                    columns={finalColumns}
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
                    scroll={tableScrollProps}
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