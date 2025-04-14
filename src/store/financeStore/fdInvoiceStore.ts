import { FdInvoiceInfoType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建财务发票模块
export const fdInvoiceViewModule: IBaseTableStore<FdInvoiceInfoType> = createTableModule<FdInvoiceInfoType>({
    name: 'fdInvoice',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.Finance.queryFdInvoiceList(params).then(response => {
                if (response) {
                    return response as Records<FdInvoiceInfoType>;
                }
                return new Records<FdInvoiceInfoType>();
            });
        }
    }
});


// 导出财务发票相关 hooks
export const useFdInvoiceViewStore = fdInvoiceViewModule.store;
export const useFdInvoiceViewState = fdInvoiceViewModule.state;
export const useFdInvoiceViewActions = fdInvoiceViewModule.actions;