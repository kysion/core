import { PromotionSettingType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建商品推广模块
export const goodsPromotionModule: IBaseTableStore<PromotionSettingType> = createTableModule<PromotionSettingType>({
    name: 'promotion',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.Goods.Promotion.queryPromotionSettingList(params).then(response => {
                if (response) {
                    return response as Records<PromotionSettingType>;
                }
                return new Records<PromotionSettingType>();
            });
        }
    }
});


// 导出商品推广相关 hooks
export const usePromotionStore = goodsPromotionModule.store;
export const usePromotionState = goodsPromotionModule.state;
export const usePromotionActions = goodsPromotionModule.actions;