import { FdBankCardType, FdBillsType, FdInvoiceInfoType, Query, Records } from "@kysion/types";
import { http } from "..";
import { AccountInfoViewType } from "@kysion/types";

export class Finance {
    /**
     * 查询财务账号列表
     * @param query 查询参数
     * @returns 财务账号列表
     */
    public static async queryAccountList(query: Query) {
        query.include = query.include ?? ['*'];
        return http.post<Records<AccountInfoViewType>>(`/platform/finance/account/queryFdAccountList`, query);
    }

    /**
     * 根据ID查询财务账号
     * @param param 查询参数
     * @returns 财务账号
     */
    public static getFdAccountById(param: { id: number }) {
        return http.post<AccountInfoViewType>(`/platform/finance/account/getFdAccountById`, param);
    }

    /**
     * 查询账单列表
     * @param query 查询参数
     * @returns 账单列表
     */
    public static queryBillsList(query: Query) {
        query.include = query.include ?? ['*'];
        return http.post<Records<FdBillsType>>(`/platform/finance/bills/queryBillsList`, query);
    }

    /**
     * 根据ID查询银行账号
     * @param param 查询参数
     * @returns 银行账号
     */
    public static getFdBankCardById(param: { id: number }) {
        return http.post<FdBankCardType>(`/platform/finance/account/getFdBankCardById`, param);
    }


    /**
     * 根据ID查询发票信息
     * @param param 查询参数
     * @returns 发票信息
     */
    public static getFdInvoiceById(param: { id: number }) {
        return http.post<FdInvoiceInfoType>(`/platform/finance/account/getFdInvoiceById`, param);
    }

    /**
     * 查询发票列表
     * @param query 查询参数
     * @returns 发票列表
     */
    public static queryFdBankCardList(query: Query) {
        query.include = query.include ?? ['*'];
        return http.post<Records<FdBankCardType>>(`/platform/finance/account/queryFdBankCardList`, query);
    }

    /**
     * 查询发票列表
     * @param query 查询参数
     * @returns 发票列表
     */
    public static queryFdInvoiceList(query: Query) {
        query.include = query.include ?? ['*'];
        return http.post<Records<FdInvoiceInfoType>>(`/platform/finance/account/queryFdInvoiceList`, query);
    }
}