import { TableParams } from "@/types/table";
import { Query, Records, RoleInfoType } from "@kysion/types";
import { KysionApis } from "../../api";
import { createSelectors, createKyStore } from "../base";

export interface IRoletStateType {
    isLoading: boolean;
    queryParams: Query;
    tableParams: TableParams;
    dataArr: Records<RoleInfoType>;
}

const initialState: IRoletStateType = {
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
    dataArr: new Records<RoleInfoType>()
};

export const useRoleStore = createKyStore<IRoletStateType>(initialState);

export const useRoleState = createSelectors(useRoleStore);

export const useRoleActions = () => {
    const set = useRoleStore.setState;
    const get = useRoleStore.getState;

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
            return KysionApis.Role.queryRoleList({ ...get().queryParams, ...queryParams }).then(res => {
                if (res) {
                    const data = res as Records<RoleInfoType>;

                    set({ dataArr: data })
                    useRoleActions().setTableParams({
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
