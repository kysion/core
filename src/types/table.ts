import { Filter, LikeWhereSet, SortSet, ValueOf, WhereType } from "@kysion/types";
import type { GetProp, TablePaginationConfig, TableProps } from 'antd';
import { CopyConfig } from "antd/es/typography/Base";
import type { ColumnType, SorterResult } from 'antd/lib/table/interface';
import { ReactNode } from "react";

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
}

export interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: SorterResult<any>['field'];
    sortOrder?: SorterResult<any>['order'];
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

export interface KyTableColumnType<T, TColumnKey extends string> extends ColumnType<T> {
    columnOption?: {
        column?: TColumnKey;
        title?: string;
        canWhere: WhereType[];
        likeWhere?: [LikeWhereSet.Contains, LikeWhereSet.Prefix, LikeWhereSet.Suffix];
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
        sorter?: boolean | undefined;
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

