import { FdBankCardInfoViewType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建财务银行卡模块
export const fdBackCardViewModule: IBaseTableStore<FdBankCardInfoViewType> = createTableModule<FdBankCardInfoViewType>({
    name: 'fdBackCard',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.Finance.queryFdBankCardList(params).then(response => {
                if (response) {
                    return response as Records<FdBankCardInfoViewType>;
                }
                return new Records<FdBankCardInfoViewType>();
            });
        }
    }
});


// 导出财务银行卡相关 hooks
export const useFdBackCardViewStore = fdBackCardViewModule.store;
export const useFdBackCardViewState = fdBackCardViewModule.state;
export const useFdBackCardViewActions = fdBackCardViewModule.actions;