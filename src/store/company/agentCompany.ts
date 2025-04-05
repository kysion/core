import { TableParams } from "../../types/table";
import { Query, Records, CompanyInfoType } from "@kysion/types";
import { KysionApis } from "../../api";
import { createSelectors, createKyStore } from "@kysion/utils";
import { StoreApi, UseBoundStore } from "zustand";
export interface IAgentCompanyStateType {
    isLoading: boolean;
    queryParams: Query;
    tableParams: TableParams;
    dataArr: Records<CompanyInfoType>;
}

const initialState: IAgentCompanyStateType = {
    isLoading: false,
    queryParams: new Query({}),
    tableParams: {
        pagination: {
            current: 1,
            pageSize: 20,
            showSizeChanger: true,
            position: ['bottomCenter'],
            // hideOnSinglePage: true,
        }
    },
    dataArr: new Records<CompanyInfoType>()
};

export const useAgentCompanyStore: UseBoundStore<StoreApi<IAgentCompanyStateType>> = createKyStore<IAgentCompanyStateType>(initialState, undefined, { name: 'company/agentCompany' });

export const useAgentCompanyState: UseBoundStore<StoreApi<IAgentCompanyStateType>> = createSelectors(useAgentCompanyStore);

export const useAgentCompanyActions = () => {
    const set = useAgentCompanyStore.setState;
    const get = useAgentCompanyStore.getState;

    return {
        setQueryParams(queryParams: Partial<Query>) {
            set({ queryParams: { ...get().queryParams, ...queryParams } });
        },
        setIsLoading(isLoading: boolean) {
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
            set({ dataArr: { ...get().dataArr, records: get().dataArr.records.filter(item => item.id !== id) } });
        },
        fetchList(queryParams: Partial<Query>) {
            set({ isLoading: true });
            return KysionApis.Org.Agent.fetchCompanyList({ ...get().queryParams, ...queryParams }).then(res => {
                if (res) {
                    const data = res as Records<CompanyInfoType>;

                    set({ dataArr: data })
                    useAgentCompanyActions().setTableParams({
                        pagination: {
                            ...get().tableParams.pagination,
                            current: data.pageNum,
                            pageSize: data.pageSize,
                            total: data.total,
                        },
                    });
                }
                return res;
            }).finally(() => set({ isLoading: false }));
        },
    }
}
