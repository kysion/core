import { RechargeInfoType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../../api";
import { IBaseTableStore, createTableModule } from "../../tableModule/tableModule";

// 创建商品模块
export const fdRechargeModule: IBaseTableStore<RechargeInfoType> = createTableModule<RechargeInfoType>({
    name: 'recharge',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.System.Finance.queryAccountRechargeView(params).then(response => {
                if (response) {
                    return response as Records<RechargeInfoType>;
                }
                return new Records<RechargeInfoType>();
            });
        }
    }
});


// 导出商品相关 hooks
export const useRechargeStore = fdRechargeModule.store;
export const useRechargeState = fdRechargeModule.state;
export const useRechargeActions = fdRechargeModule.actions;