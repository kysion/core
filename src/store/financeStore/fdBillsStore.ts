import { FdBillsViewType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建财务账单模块
export const fdBillsViewModule: IBaseTableStore<FdBillsViewType> = createTableModule<FdBillsViewType>({
    name: 'fdBills',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.Finance.queryBillsList(params).then(response => {
                if (response) {
                    return response as Records<FdBillsViewType>;
                }
                return new Records<FdBillsViewType>();
            });
        }
    }
});


// 导出财务账单相关 hooks
export const useFdBillsViewStore = fdBillsViewModule.store;
export const useFdBillsViewState = fdBillsViewModule.state;
export const useFdBillsViewActions = fdBillsViewModule.actions;