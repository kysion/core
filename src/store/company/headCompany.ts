import { TableParams } from "../../types/table";
import { Query, Records, CompanyInfoType } from "@kysion/types";
import { KysionApis } from "../../api";
import { createSelectors, createKyStore } from "@kysion/utils";
import { StoreApi, UseBoundStore } from "zustand";
export interface IHeadCompanyStateType {
    isLoading: boolean;
    queryParams: Query;
    tableParams: TableParams;
    dataArr: Records<CompanyInfoType>;
}

const initialState: IHeadCompanyStateType = {
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

export const useHeadCompanyStore: UseBoundStore<StoreApi<IHeadCompanyStateType>> = createKyStore<IHeadCompanyStateType>(initialState, undefined, { name: 'company/headCompany' });

export const useHeadCompanyState: UseBoundStore<StoreApi<IHeadCompanyStateType>> = createSelectors(useHeadCompanyStore);

export const useHeadCompanyActions = () => {
    const set = useHeadCompanyStore.setState;
    const get = useHeadCompanyStore.getState;

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
            return KysionApis.Org.HeadCompany.fetchCompanyList({ ...get().queryParams, ...queryParams }).then(res => {
                if (res) {
                    const data = res as Records<CompanyInfoType>;

                    set({ dataArr: data })
                    useHeadCompanyActions().setTableParams({
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
