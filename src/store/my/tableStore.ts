import { TableColumnOption } from "../../types/table";
import { createKyStore, createSelectors } from "@kysion/utils";
import { Funs } from "@kysion/utils";
import { KysionApis } from "../../api";
import { useMyProfileState } from "./userStore";

export interface IMyTableStateType {
    tableColumnOptionArr: TableColumnOption[];
}

const initialState: IMyTableStateType = {
    tableColumnOptionArr: []
}

export const useTableStore = createKyStore<IMyTableStateType>(initialState, {
    storageKey: 'myTablePreference',
    crypto: Funs.getEnv('APP_DEBUG_MODE', false, (v) => v === 'false')
});

export const useTableState = createSelectors(useTableStore);

export const useTableActions = () => {
    const set = useTableStore.setState;
    const get = useTableStore.getState;

    return {
        setTableColumnOption(tableColumnOption: TableColumnOption, isSave: boolean = false) {
            const tableColumnOptionArr = get().tableColumnOptionArr;
            const index = tableColumnOptionArr.findIndex(item => item.name === tableColumnOption.name);
            if (index > -1) {
                tableColumnOptionArr[index] = { ...tableColumnOption, pageSize: tableColumnOption.pageSize || get().tableColumnOptionArr[index].pageSize || 20 };
            } else {
                tableColumnOptionArr.push({ ...tableColumnOption, pageSize: tableColumnOption.pageSize || 20 });
            }

            set({ tableColumnOptionArr })

            if (!isSave) return Promise.resolve({ data: tableColumnOption.columnOptionArr, error: undefined, success: true });

            return useTableActions().save();
        },
        getTableColumnOption(name: React.Key) {
            return (
                get()
                    .tableColumnOptionArr.find(item => item.name === name)
                    ?.columnOptionArr.sort((a, b) => a.sort - b.sort) ?? []
            );
        },
        getTablePageSize(name: React.Key) {
            return get()
                .tableColumnOptionArr.find(item => item.name === name)?.pageSize ?? 20;
        },
        setTablePageSize(name: React.Key, pageSize: number) {
            const info = get()
                .tableColumnOptionArr.find(item => item.name === name);

            if (info)
                info.pageSize = pageSize;

            set({ tableColumnOptionArr: get().tableColumnOptionArr });
        },
        async refresh() {
            const { user } = useMyProfileState();
            return await KysionApis.MyProfile.getSettingByName<IMyTableStateType>({ name: 'my_table_setting', userId: user.id }).then(res => {
                if (res) {
                    set({ tableColumnOptionArr: res.values?.tableColumnOptionArr || [] });
                }
            })
        },
        save() {
            return KysionApis.MyProfile.setSettingByName<IMyTableStateType>({
                name: 'my_table_setting',
                values: get(),
                desc: '我的表格设置'
            });
        },

    }
}