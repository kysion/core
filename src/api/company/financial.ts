import { http } from "../base";
import {
    AccountInfoType,
    AccountLimitStatusSet,
    FdApplyInvoiceType,
    FdBankCardType,
    BankCardTypeSet,
    FdBillsDetailType,
    FdInvoiceInfoType,
    InvoiceStateSet,
    FdMakeInvoiceDetailType,
    MakeInvoiceTypeSet,
    Query,
    Records,
    CurrencyType,
    FdBillsType
} from "@kysion/types";

export class Financial {
    private urlPrefix: string;
    constructor(params: { urlPrefix: string }) {
        this.urlPrefix = params.urlPrefix;
    }

    public setUrlPrefix(urlPrefix: string) {
        this.urlPrefix = urlPrefix;
    }

    public getPrefix() {
        return this.urlPrefix;
    }

    // 审核发票
    public auditInvoiceDetail(data: { invoiceDetailId: string | number, AuditInfo: { state: 2 | 4, auditUserId: string | number; replyMsg: string } }) {
        return http.post<boolean>(`/${this.urlPrefix}/financial/auditInvoiceDetail`, data);
    }

    // 删除银行卡
    public deleteBankCard(data: { bankCardId: string | number }) {
        return http.post<boolean>(`/${this.urlPrefix}/financial/deleteBankCard`, data);
    }

    // 删除发票抬头
    public deleteInvoiceById(data: { invoiceId: string | number }) {
        return http.post<boolean>(`/${this.urlPrefix}/financial/deleteInvoiceById`, data);
    }

    // 查看账户余额
    public getAccountBalance(params: { accountId: string | number }) {
        return http.post<number>(`/${this.urlPrefix}/financial/getAccountBalance`, params);
    }

    // 获取财务账号详细数据
    public getAccountDetail(data: { accountId: string | number, include?: string[] }) {
        return http.post<AccountInfoType>(`/${this.urlPrefix}/financial/getAccountDetail`, data);
    }

    // 获取财务账号金额明细
    public getAccountDetailByAccountId(accountId: string | number) {
        return http.post<FdBillsDetailType>(`/${this.urlPrefix}/financial/getAccountDetailByAccountId`, {
            accountId
        });
    }

    // 申请开发票
    public applyInvoice(data: Partial<FdInvoiceInfoType> & {
        taxId: string; taxName: string; billIds: string; amount: number; rate: number; rateMount: number; remark: string;
        type: MakeInvoiceTypeSet;
        state: InvoiceStateSet;
    }) {
        return http.post<FdInvoiceInfoType>(`/${this.urlPrefix}/financial/invoiceDetailRegister`, data);
    }

    // 添加发票抬头
    public addInvoiceTemplate(data: Partial<FdInvoiceInfoType> & { name: string; taxId: string; }) {
        return http.post<FdInvoiceInfoType>(`/${this.urlPrefix}/financial/invoiceRegister`, data);
    }

    // 开发票
    public makeInviceDetail(data: Partial<FdMakeInvoiceDetailType> & { invoiceDetailId: number; type: MakeInvoiceTypeSet; }) {
        return http.post<boolean>(`/${this.urlPrefix}/financial/makeInvoiceDetail`, data);
    }

    // 获取银行卡列表
    public queryBankCardList(params: Query) {
        return http.post<Records<FdBankCardType>>(`/${this.urlPrefix}/financial/queryBankCardList`, params);
    }

    //获取发票抬头|列表
    public queryInvoiceTemplateList(params: Query & { userId: string | number }) {
        return http.post<Records<FdInvoiceInfoType>>(`/${this.urlPrefix}/financial/queryInvoice`, params);
    }

    // 获取发票详情|列表
    public queryInvoiceDetailList(params: Query) {
        return http.post<Records<FdApplyInvoiceType>>(`/${this.urlPrefix}/financial/queryInvoiceDetailList`, params);
    }

    // 添加银行卡
    public addBankCard(data: Partial<FdBankCardType> & { bankName: string, cardType: BankCardTypeSet, cardNumber: string, holderName: string }) {
        return http.post<FdBankCardType>(`/${this.urlPrefix}/financial/registerBankCard`, data);
    }

    // 设置财务账号是否允许存在负余额
    public setAccountAllowExceed(data: { accountId: string | number, allowExceed: boolean }) {
        return http.post<boolean>(`/${this.urlPrefix}/financial/setAccountAllowExceed`, data);
    }

    // 设置财务账号启用状态
    public setAccountIsEnabled(data: { accountId: string | number, isEnabled: boolean }) {
        return http.post<boolean>(`/${this.urlPrefix}/financial/updateAccountIsEnabled`, data);
    }

    // 修改财务账号限制状态
    public updateAccountLimitState(data: { accountId: string | number, state: AccountLimitStatusSet }) {
        return http.post<boolean>(`/${this.urlPrefix}/financial/updateAccountLimitState`, {
            accountId: data.accountId,
            isEnabled: data.state,
        });
    }

    // 获取币种列表
    public queryCurrencyList(query?: Query) {
        return http.post<Records<CurrencyType>>(`/${this.urlPrefix}/financial/queryCurrencyList`, query);
    }

    // 设置财务账号货币单位
    public setAccountCurrencyCode(data: { accountId: string | number; currencyCode: string }) {
        return http.post(`/${this.urlPrefix}/financial/setAccountCurrencyCode`, data);
    }

    // 获取货币单位信息
    public getCurrencyByCode(currencyCode: string) {
        return http.post<CurrencyType>(`/${this.urlPrefix}/financial/getCurrencyByCode`, { currencyCode });
    }

    public queryAccountBills(params: { accountId: string | number }) {
        return http.post<Records<FdBillsType>>(`/${this.urlPrefix}/financial/queryAccountBills`, params);
    }
} 