import { GoodsInfoType, PromotionSettingType, Query, Records } from "@kysion/types";
import { http } from "../base";

export class GoodsPromotion {
    /**
     * 删除推广设置
     * @param data 包含推广设置ID的对象
     */
    public static deletePromotionSetting(data: { id: React.Key }) {
        return http.post<boolean>('/goods/promotion/deletePromotionSetting', data);
    }

    /**
     * 根据ID获取推广设置
     * @param data 包含推广设置ID的对象
     */
    public static getPromotionSettingById(data: { id: React.Key }) {
        return http.post<PromotionSettingType>('/goods/promotion/getPromotionSettingById', data);
    }

    /**
     * 查询推广设置列表
     * @param params 查询参数
     */
    public static queryPromotionSettingList(params: Query) {
        return http.post<Records<PromotionSettingType>>('/goods/promotion/queryPromotionSettingList', params);
    }

    /**
     * 保存推广设置
     * @param data 推广设置信息
     */
    public static savePromotionSetting(data: PromotionSettingType) {
        return http.post<PromotionSettingType>('/goods/promotion/savePromotionSetting', data);
    }

    /**
     * 设置推广上下架状态
     * @param data 包含推广设置ID及状态的对象
     */
    public static setPromotionSettingState(data: { id: React.Key; state: number }) {
        return http.post<boolean>('/goods/promotion/setPromotionSettingState', data);
    }

    /**
     * 获取推广活动
     * @param data 包含推广码的对象
     */
    public static takePromotionOrder(data: { promotionCode?: string } = {}) {
        return http.post<{
            goods: GoodsInfoType;
            goodsPromotionSettingId: number;
        }>('/goods/promotion/takePromotionOrder', data);
    }
}
