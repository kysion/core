import { TableParams } from "../../types/table";
import { Query, Records, CompanyInfoType } from "@kysion/types";
import { KysionApis } from "../../api";
import { createSelectors, createKyStore } from "@kysion/utils";
import { StoreApi, UseBoundStore } from "zustand";
export interface ISubCompanyStateType {
    isLoading: boolean;
    queryParams: Query;
    tableParams: TableParams;
    dataArr: Records<CompanyInfoType>;
}

const initialState: ISubCompanyStateType = {
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

export const useSubCompanyStore: UseBoundStore<StoreApi<ISubCompanyStateType>> = createKyStore<ISubCompanyStateType>(initialState, undefined, { name: 'company/subCompany' });

export const useSubCompanyState: UseBoundStore<StoreApi<ISubCompanyStateType>> = createSelectors(useSubCompanyStore);

export const useSubCompanyActions = () => {
    const set = useSubCompanyStore.setState;
    const get = useSubCompanyStore.getState;

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
            return KysionApis.Org.SubCompany.fetchCompanyList({ ...get().queryParams, ...queryParams }).then(res => {
                if (res) {
                    const data = res as Records<CompanyInfoType>;

                    set({ dataArr: data })
                    useSubCompanyActions().setTableParams({
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
