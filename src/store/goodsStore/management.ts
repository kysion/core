import { GoodsInfoType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建商品模块
export const goodsManagementModule: IBaseTableStore<GoodsInfoType> = createTableModule<GoodsInfoType>({
    name: 'goods',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.Goods.Management.queryGoodsList(params).then(response => {
                if (response) {
                    return response as Records<GoodsInfoType>;
                }
                return new Records<GoodsInfoType>();
            });
        }
    }
});


// 导出商品相关 hooks
export const useGoodsStore = goodsManagementModule.store;
export const useGoodsState = goodsManagementModule.state;
export const useGoodsActions = goodsManagementModule.actions;