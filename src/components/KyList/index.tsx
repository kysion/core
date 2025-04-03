import { FC, ReactNode, useEffect, useState } from 'react';
import { Button, Flex, Table, TableProps, Tooltip } from 'antd';
import { KyIcon } from '../icon';
import { PageContainer } from '../PageContainer';
import { makeTableColumnState, SettingTableDrawer, TableColumn } from './setting';
import { useTranslation } from 'react-i18next';
import { FixedStateSet, KyTableColumnType } from '../../types/table';
import type { ColumnsType } from 'antd/es/table';
import { KyTranslate } from '../KyTranslate';
import { useTableActions } from '../../store';
import React from 'react';

export * from './table';
export * from './setting';

export interface KyListProps<T = any> extends Omit<TableProps<T>, 'columns' | 'title'> {
    // 基础属性
    title?: ReactNode;
    identifier: string;
    extraActions?: ReactNode[] | ((items: ReactNode[]) => ReactNode[]);

    // 列配置
    columns: KyTableColumnType<T, any>[];
    onColumnsChange?: (columns: KyTableColumnType<T, any>[]) => void;

    // 表格设置
    settingDrawer?: {
        visible?: boolean;
        onVisibleChange?: (visible: boolean) => void;
        getDefaultDataSource: () => TableColumn[];
    };

    // 刷新功能
    onRefresh?: () => void;
    refreshLoading?: boolean;

    // 样式
    className?: string;
}

export const KyList: FC<KyListProps> = ({
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
    const [columns, setColumns] = useState<ColumnsType<any>>(propColumns);
    const [settingVisible, setSettingVisible] = useState(false);
    const { setTableColumnOption } = useTableActions();

    // 同步外部列变化
    useEffect(() => {
        setColumns(propColumns);
    }, [propColumns]);


    // 处理列变化
    const handleColumnsChange = (data: TableColumn[]) => {
        console.log('data', data);

        // 创建一个Map来存储data中的columnSort
        const sortMap = new Map(data.map(item => [(item as any).key, item.sort]));

        const newColumns = makeTableColumnState(columns.map(col => {
            const matchedCol = data.find(item => {
                return (item as any).key === ((col as any).dataIndex || col.key);
            });
            if (matchedCol) {
                const fixed = matchedCol.fixed === 'none' ? undefined :
                    matchedCol.fixed === 'left' ? ('left' as FixedStateSet) :
                        matchedCol.fixed === 'right' ? ('right' as FixedStateSet) : undefined;

                // 保存原始的 columnOptionState
                if ((col as any).columnOptionState) {
                    (col as any).columnOptionState = {
                        ...(col as any).columnOptionState,
                        fixed: matchedCol.fixed,
                        hidden: matchedCol.hidden,
                        sortBy: matchedCol.sortBy,
                        sorter: matchedCol.sorter,
                        disabled: matchedCol.disabled,
                        where: matchedCol.where,
                        likeWhere: matchedCol.likeWhere,
                    };
                }

                // 确保固定列有明确的宽度
                const width = (col as any).width || (fixed ? 150 : undefined);

                return {
                    ...col,
                    fixed,
                    width,
                    hidden: matchedCol.hidden,
                    sorter: matchedCol.sorter,
                } as ColumnsType<any>[number];
            }
            return col;
        }).sort((a, b) => {
            // 根据columnSort排序
            const aSort = sortMap.get((a as any).dataIndex || (a as any).key) ?? 0;
            const bSort = sortMap.get((b as any).dataIndex || (b as any).key) ?? 0;
            return aSort - bSort;
        }));

        setColumns(newColumns);
        onColumnsChange?.(newColumns as KyTableColumnType<any, any>[]);

        // 确保列设置被保存
        if (identifier) {
            setTableColumnOption({
                name: identifier,
                columnOptionArr: data,
            });
        }
    };

    // 构建操作按钮
    const actionButtons = [
        // 刷新按钮
        onRefresh && (
            <Tooltip key="refresh" title={t('kysion.common.refresh.tooltip')} placement="bottom">
                <Button
                    color="primary"
                    variant="filled"
                    loading={refreshLoading}
                    icon={<KyIcon fontSize={24} icon="bitcoin-icons:refresh-filled" />}
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
                    icon={<KyIcon fontSize={18} icon="ant-design:setting-outlined" />}
                    onClick={() => setSettingVisible(true)}
                />
            </Tooltip>
        ),
    ];

    const curColumns = columns.map((col: any) => {
        const title = col.title as any;
        col.title = typeof title === 'string' ? title : title.props?.localeKey ? <KyTranslate localeKey={title.props.localeKey} /> : title;

        // 确保固定列有明确的宽度
        if (col.fixed && !col.width) {
            col.width = 80;
        }

        return col;
    }).filter(col => col.hidden !== true);

    return (
        <PageContainer
            title={title}
            extra={(Array.isArray(extraActions) ? extraActions : extraActions(actionButtons)).filter(Boolean)}
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
                    columns={curColumns}
                    scroll={{
                        x: curColumns
                            .filter((item) => item.width && !item.hidden)
                            .map((item) => {
                                if (typeof item.width === 'number') return item.width;
                                if (typeof item.width === 'string') return Number.parseInt(item.width, 10) ?? 80;
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