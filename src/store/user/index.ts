import { TableParams } from "@/types/table";
import { Query, Records, UserInfoType } from "@kysion/types";
import { KysionApis } from "../../api";
import { createSelectors, createKyStore } from "../base";

export interface IUsertStateType {
    isLoading: boolean;
    queryParams: Query;
    tableParams: TableParams;
    dataArr: Records<UserInfoType>;
}

const initialState: IUsertStateType = {
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
    dataArr: new Records<UserInfoType>()
};

export const useUserStore = createKyStore<IUsertStateType>(initialState);

export const useUserState = createSelectors(useUserStore);

export const useUserActions = () => {
    const set = useUserStore.setState;
    const get = useUserStore.getState;

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
            return KysionApis.User.queryUserList({ ...get().queryParams, ...queryParams }).then(res => {
                if (res) {
                    const data = res as Records<UserInfoType>;

                    set({ dataArr: data })
                    useUserActions().setTableParams({
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
