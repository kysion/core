/**
 * 通用表格模块
 * 
 * 这是一个可复用的通用表格数据管理模块，基于zustand状态管理库实现。
 * 该模块用于处理与表格相关的状态和操作，如加载状态、查询参数、分页配置和数据源等。
 * 通过泛型支持，可以适用于任何具有id字段的数据类型。
 * 
 * @module tableModule
 */

import { IKyTableActions, TableParams } from "../../types/table";
import { Query, Records } from "@kysion/types";
import { createSelectors, createKyStore } from "@kysion/utils";
import { StoreApi, UseBoundStore } from "zustand";

/**
 * 基础表格配置接口
 * 
 * 定义创建表格模块所需的配置参数
 * 
 * @template T 表格数据类型，必须包含id字段
 */
export interface BaseTableConfig<T extends { id: React.Key }> {
    /**
     * 存储名称，用于持久化和调试
     */
    name: string;

    /**
     * API对象，包含获取列表数据的方法
     * 此对象会在运行时动态获取，以便延迟到调用时
     */
    getApi: {
        /**
         * 获取列表数据的方法
         * @param params 查询参数
         * @returns 返回Promise包含Records数据结构
         */
        fetchList: (params: any) => Promise<Records<T>>;
    };
}

/**
 * 基础表格状态类型
 * 
 * 定义表格模块的状态结构
 * 
 * @template T 表格数据类型
 */
export interface IBaseTableStateType<T> {
    /**
     * 加载状态标志
     */
    isLoading: boolean;

    /**
     * 查询参数
     */
    queryParams: Query;

    /**
     * 表格参数（包含分页、排序等）
     */
    tableParams: TableParams;

    /**
     * 表格数据源
     */
    dataSource: Records<T>;
}

/**
 * 表格Store接口
 * 
 * 定义表格模块的对外暴露结构，包含store实例、状态选择器和操作方法
 * 
 * @template T 表格数据类型
 */
export interface IBaseTableStore<T> {
    /**
     * Zustand store实例
     */
    store: UseBoundStore<StoreApi<IBaseTableStateType<T>>>;

    /**
     * 状态选择器，用于获取状态中的特定字段
     */
    state: ReturnType<typeof createSelectors<UseBoundStore<StoreApi<IBaseTableStateType<T>>>>>;

    /**
     * 表格操作方法，返回一组用于操作表格状态的函数
     */
    actions: () => IKyTableActions<T>;
}

/**
 * 创建初始状态
 * 
 * 返回表格模块的初始状态对象
 * 
 * @template T 表格数据类型
 * @returns 初始状态对象
 */
export function createInitialState<T>(): IBaseTableStateType<T> {
    return {
        isLoading: false,
        queryParams: new Query({}),
        tableParams: {
            pagination: {
                current: 1,
                pageSize: 20,
                showSizeChanger: true,
                position: ['bottomCenter'],
            }
        },
        dataSource: new Records<T>(),
    };
}

/**
 * 创建通用表格模块
 * 
 * 这是表格模块的工厂函数，根据提供的配置创建一个完整的表格数据管理模块
 * 
 * @template T 表格数据类型，必须包含id字段
 * @param config 表格模块配置
 * @returns 表格Store对象，包含store实例、状态选择器和操作方法
 */
export function createTableModule<T extends { id: React.Key }>(config: BaseTableConfig<T>): IBaseTableStore<T> {
    // 创建初始状态
    const initialState = createInitialState<T>();

    // 创建zustand store
    const store = createKyStore<IBaseTableStateType<T>>(
        initialState,
        undefined,
        { name: config.name }
    );

    // 创建状态选择器
    const state = createSelectors(store);

    /**
     * 表格操作方法集合
     * 
     * 提供一组用于操作表格状态的函数
     * 
     * @returns IKyTableActions 操作方法对象
     */
    const actions = (): IKyTableActions<T> => {
        const set = store.setState;
        const get = store.getState;

        return {
            /**
             * 设置查询参数
             * 
             * @param queryParams 要更新的查询参数
             */
            setQueryParams(queryParams: Partial<Query>) {
                set({ queryParams: { ...get().queryParams, ...queryParams } });
            },

            /**
             * 设置加载状态
             * 
             * @param isLoading 是否处于加载中
             */
            setLoading(isLoading: boolean) {
                set({ isLoading });
            },

            /**
             * 设置表格参数
             * 
             * @param tableParams 要更新的表格参数
             */
            setTableParams(tableParams: Partial<TableParams>) {
                set({
                    tableParams: {
                        ...get().tableParams,
                        ...tableParams,
                        pagination: {
                            ...get().tableParams.pagination,
                            ...tableParams.pagination
                        }
                    },
                });
            },

            /**
             * 移除指定id的数据项
             * 
             * @param id 要移除的数据项id
             */
            removeItem(id: React.Key) {
                set({ dataSource: { ...get().dataSource, records: get().dataSource.records.filter((item: T) => item.id !== id) } });
            },

            /**
             * 获取列表数据
             * 
             * 调用API获取数据并更新状态
             * 
             * @param queryParams 查询参数
             * @returns Promise包含Records数据
             */
            fetchList(queryParams: Partial<Query>) {
                set({ isLoading: true });
                // 调用API获取数据
                return config.getApi.fetchList({ ...get().queryParams, ...queryParams }).then(res => {
                    if (res) {
                        const data = res as Records<T>;
                        // 更新数据源
                        set({ dataSource: data })
                        // 更新分页参数
                        actions().setTableParams({
                            pagination: {
                                ...get().tableParams.pagination,
                                current: data.pageNum,
                                pageSize: data.pageSize,
                                total: data.total,
                            },
                        });
                    }
                    return new Records<T>();
                }).finally(() => set({ isLoading: false }));
            },
        }
    };

    // 返回表格模块对象
    return {
        store,
        state,
        actions
    };
} 