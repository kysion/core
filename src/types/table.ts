import { Filter, LikeWhereSet, Query, Records, SortSet, ValueOf, WhereType } from "@kysion/types";
import { createSelectors } from "@kysion/utils";
import type { GetProp, TablePaginationConfig, TableProps } from 'antd';
import { CopyConfig } from "antd/es/typography/Base";
import type { ColumnType, SorterResult } from 'antd/lib/table/interface';
import { ReactNode } from "react";
import { StoreApi, UseBoundStore } from "zustand";

export const fixedStateSet = {
    None: 'none',
    Left: 'left',
    Right: 'right'
} as const;

export type FixedStateSet = ValueOf<typeof fixedStateSet>;

export const FixedStateArr: readonly [FixedStateSet, string][] = [
    [fixedStateSet.None, 'kysion.table.column.fixedState.None'],
    [fixedStateSet.Left, 'kysion.table.column.fixedState.Left'],
    [fixedStateSet.Right, 'kysion.table.column.fixedState.Right']
];

export const FixedStateMap = new Map<FixedStateSet, string>(FixedStateArr.map(item => [item[0], item[1]]));

export interface TableColumnOption {
    name: React.Key;
    pageSize?: number;
    columnOptionArr: any[];
    version?: string;
    updatedAt?: number;
    source?: 'local' | 'remote' | 'default';
    isDeleted?: boolean;
}

export interface ITableStateType<T> {
    isLoading: boolean;
    queryParams: Query;
    tableParams: TableParams;
    dataSource: Records<T>;
}

export interface IKyTableStore<T> {
    store: UseBoundStore<StoreApi<ITableStateType<T>>>;
    state: ReturnType<typeof createSelectors<UseBoundStore<StoreApi<ITableStateType<T>>>>>;
    actions: () => IKyTableActions<T>;
}

export interface IKyTableActions<T> {
    setQueryParams: (queryParams: Partial<Query>) => void;
    setLoading: (isLoading: boolean) => void;
    setTableParams: (tableParams: Partial<TableParams>) => void;
    removeItem: (id: React.Key) => void;
    fetchList: (queryParams: Partial<Query>) => Promise<Records<T>>;
}

export interface TableParams {
    pagination?: TablePaginationConfig;
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
    sorter?: Parameters<GetProp<TableProps, 'onChange'>>[2];
}

export interface KyTableColumnType<T, TColumnKey extends string> extends ColumnType<T> {
    type?: 'selection';
    columnOption?: {
        column?: TColumnKey;
        title?: string;
        canWhere: WhereType[];
        likeWhere?: LikeWhereSet[];
        fixed?: FixedStateSet[] | undefined;
        hidden?: boolean | undefined;
        sortBy?: true | SortSet[] | undefined;
        sort?: number | undefined;
        sorter?: boolean | undefined;
        disabled?: boolean | undefined;
    };
    columnSort?: number;
    fieldOption?: (opt: Filter) => Filter;
    columnOptionState?: {
        column?: TColumnKey;
        value?: React.Key | React.Key[] | boolean | boolean[];
        where: WhereType | undefined;
        likeWhere?: LikeWhereSet | undefined;
        fixed?: FixedStateSet | undefined;
        hidden?: boolean | undefined;
        sortBy?: true | SortSet | undefined;
        sort?: number | undefined;
        sorter?: boolean | undefined | { multiple: 1 };
        disabled?: boolean | undefined;
    };
    makeColumnSearchProps?({
        dataIndex,
        title,
        render,
        onFilter,
        onMaskValueText,
        copyable
    }: {
        dataIndex: keyof T;
        title?: string;
        render?: (text: string, row: T) => ReactNode;
        onFilter?: (value: React.Key | boolean, record: T) => boolean;
        onMaskValueText?: (text: string) => string;
        copyable?: boolean | CopyConfig;
    }): KyTableColumnType<T, TColumnKey>;
}

