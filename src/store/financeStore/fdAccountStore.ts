import { AccountInfoViewType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建财务账号模块
export const fdAccountViewModule: IBaseTableStore<AccountInfoViewType> = createTableModule<AccountInfoViewType>({
    name: 'fdAccount',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.Finance.queryAccountList(params).then(response => {
                if (response) {
                    return response as Records<AccountInfoViewType>;
                }
                return new Records<AccountInfoViewType>();
            });
        }
    }
});


// 导出财务账号相关 hooks
export const useFdAccountViewStore = fdAccountViewModule.store;
export const useFdAccountViewState = fdAccountViewModule.state;
export const useFdAccountViewActions = fdAccountViewModule.actions;