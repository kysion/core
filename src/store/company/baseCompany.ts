import { IKyTableActions, TableParams } from "../../types/table";
import { Query, Records, CompanyInfoType } from "@kysion/types";
import { createSelectors, createKyStore } from "@kysion/utils";
import { StoreApi, UseBoundStore } from "zustand";

// 基础公司配置接口
export interface BaseCompanyConfig {
    name: string; // 存储名称，用于持久化
    getApi: () => { fetchCompanyList: (params: any) => Promise<Records<CompanyInfoType>> }; // 获取API的函数，延迟到调用时
}



// 基础状态类型
export interface IBaseCompanyStateType {
    isLoading: boolean;
    queryParams: Query;
    tableParams: TableParams;
    dataSource: Records<CompanyInfoType>;
}

export interface IBaseCompanyStore {
    store: UseBoundStore<StoreApi<IBaseCompanyStateType>>;
    state: ReturnType<typeof createSelectors<UseBoundStore<StoreApi<IBaseCompanyStateType>>>>;
    actions: () => IKyTableActions<CompanyInfoType>;
}

// 初始状态
export const baseInitialState: IBaseCompanyStateType = {
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
    dataSource: new Records<CompanyInfoType>(),
};

// 创建公司模块工厂
export function createCompanyModule(config: BaseCompanyConfig): IBaseCompanyStore {
    const store = createKyStore<IBaseCompanyStateType>(
        baseInitialState,
        undefined,
        { name: config.name }
    );

    const state = createSelectors(store);

    const actions = (): IKyTableActions<CompanyInfoType> => {
        const set = store.setState;
        const get = store.getState;

        return {
            setQueryParams(queryParams: Partial<Query>) {
                set({ queryParams: { ...get().queryParams, ...queryParams } });
            },
            setLoading(isLoading: boolean) {
                set({ isLoading });
            },
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
            removeItem(id: React.Key) {
                set({ dataSource: { ...get().dataSource, records: get().dataSource.records.filter(item => item.id !== id) } });
            },
            fetchList(queryParams: Partial<Query>) {
                set({ isLoading: true });
                // 在这里调用 getApi 获取API实例
                const api = config.getApi();
                return api.fetchCompanyList({ ...get().queryParams, ...queryParams }).then(res => {
                    if (res) {
                        const data = res as Records<CompanyInfoType>;
                        set({ dataSource: data })
                        actions().setTableParams({
                            pagination: {
                                ...get().tableParams.pagination,
                                current: data.pageNum,
                                pageSize: data.pageSize,
                                total: data.total,
                            },
                        });
                    }
                    return new Records<CompanyInfoType>();
                }).finally(() => set({ isLoading: false }));
            },
        }
    };

    return {
        store,
        state,
        actions
    };
} 