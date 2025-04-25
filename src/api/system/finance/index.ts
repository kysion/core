import { CurrencyInfoType, Query, Records } from '@kysion/types';
import { http } from '../../base'

export class Finance {

    // 获取币种列表
    public static queryCurrencyList(query?: Query) {
        return http.post<Records<CurrencyInfoType>>(`/system/finance/queryCurrencyList`, query);
    }

    // 获取货币单位信息
    public static getCurrencyByCode(params: { currencyCode: string }) {
        return http.post<CurrencyInfoType>(`/system/finance/getCurrencyByCode`, params);
    }

    // 获取财务账号充值详情
    public static getAccountRechargeViewById(params: { id: number }) {
        return http.get<any>('/system/finance/getAccountRechargeViewById', params)
    }

    public static queryAccountRechargeView(params: Query) {
        return http.post<Records<any>>('/system/finance/queryAccountRechargeView', params)
    }
}