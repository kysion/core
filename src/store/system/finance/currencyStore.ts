import { CurrencyInfoType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../../api";
import { IBaseTableStore, createTableModule } from "../../tableModule/tableModule";

// 创建商品模块
export const fdCurrencyModule: IBaseTableStore<CurrencyInfoType> = createTableModule<CurrencyInfoType>({
    name: 'currency',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.System.Finance.queryCurrencyList(params).then(response => {
                if (response) {
                    return response as Records<CurrencyInfoType>;
                }
                return new Records<CurrencyInfoType>();
            });
        }
    }
});


// 导出商品相关 hooks
export const useCurrencyStore = fdCurrencyModule.store;
export const useCurrencyState = fdCurrencyModule.state;
export const useCurrencyActions = fdCurrencyModule.actions;