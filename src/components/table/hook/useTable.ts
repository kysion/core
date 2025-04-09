import React, { useCallback, useState } from "react";
import { Funs } from "@kysion/utils";
import { UseKyTableActionsProps } from "../types";
import { KyTableColumnType } from "../../../types";
import { useMyProfileState, useTableActions } from "../../../store";

// 定义返回类型接口，避免直接使用React特有类型
export interface UseKyTableReturn<T, K extends string> {
    identifier: string;
    initColumns: () => void;
    columnStateArr: KyTableColumnType<T, K>[];
    setColumnStateArr: (value: KyTableColumnType<T, K>[] | ((prev: KyTableColumnType<T, K>[]) => KyTableColumnType<T, K>[])) => void;
    makeColumns: (isDefault?: boolean) => any[];
    getPageSize: () => number;
    setPageSize: (pageSize: number) => void;
}

export const useKyTable = <T, K extends Extract<keyof T, string> | 'operations'>(
    props: UseKyTableActionsProps<T, K>
): UseKyTableReturn<T, K> => {
    const [columnStateArr, setColumnStateArr] = useState<KyTableColumnType<T, K>[]>([]);
    const { getTablePageSize, setTablePageSize } = useTableActions();
    const { identifier, columnWidths } = props;
    const { handleView, handleEdit } = props.tableListActions;
    const parentCompanyId = useMyProfileState(state => state.company.id);

    /**
     * 创建表格列配置的封装函数
     */
    const createColumns = useCallback((isDefault: boolean = false) => {
        return props.makeColumns(isDefault);
    }, [columnWidths, identifier, handleView, handleEdit, parentCompanyId, props.makeColumns]);

    /**
     * 获取页面大小
     */
    const getPageSize = useCallback(() => {
        return getTablePageSize(props.identifier) || Funs.getEnv('APP_DEFAULT_PAGE_SIZE', 10, (v) => Number(v));
    }, [getTablePageSize, props.identifier]);

    /**
     * 设置表格页面大小
     */
    const setPageSize = useCallback((pageSize: number) => {
        setTablePageSize(props.identifier, pageSize);
    }, [setTablePageSize, props.identifier]);

    /**
     * 初始化列配置
     */
    const initColumns = useCallback(() => {
        setColumnStateArr(createColumns());
    }, [createColumns]);

    return {
        identifier: props.identifier,
        initColumns,
        columnStateArr,
        setColumnStateArr,
        makeColumns: createColumns,
        getPageSize,
        setPageSize,
    }
}