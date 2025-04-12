import { OrderInfoType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建订单模块
export const orderModule: IBaseTableStore<OrderInfoType> = createTableModule<OrderInfoType>({
    name: 'order',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.Orders.queryOrdersList(params).then(response => {
                if (response) {
                    return response as Records<OrderInfoType>;
                }
                return new Records<OrderInfoType>();
            });
        }
    }
});


// 导出订单相关 hooks
export const useOrderStore = orderModule.store;
export const useOrderState = orderModule.state;
export const useOrderActions = orderModule.actions;

// 导出模块
export { orderModule as default };