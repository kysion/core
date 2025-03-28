import { useActionState } from "react";
import { http } from "../base";
import {
    AccountBillDetailType,
    AccountInfoType,
    AccountTypeSet,
    AllowNegativeBalanceSet,
    BankCardType,
    CompanyType,
    InvoiceInfoType,
    PermissionType,
    PermissionTypeSet,
    ProfileType,
    Query,
    Records,
    TeamType,
} from "@kysion/types";
import { useUserActions } from "../../store";

export class My {
    private urlPrefix: string;
    constructor(params: { urlPrefix: string }) {
        this.urlPrefix = params.urlPrefix;
    }

    // 我的账单|列表
    public getAccountBills(params: Query) {
        return http.post<Records<AccountBillDetailType>>(`/${this.urlPrefix}/my/getAccountBills`, params);
    }

    // 我的财务账号|列表
    public getAccounts() {
        return http.post<Records<AccountInfoType>>(`/${this.urlPrefix}/my/getAccounts`, {
            include: ['detail']
        });
    }

    // 我的银行卡｜列表
    public getBankCards() {
        return http.post<Records<BankCardType>>(`/${this.urlPrefix}/my/getBankCards`);
    }

    // 我的发票抬头｜列表
    public getInvoices() {
        return http.post<Records<InvoiceInfoType>>(`/${this.urlPrefix}/my/getInvoices`);
    }

    // 修改我的财务账号｜信息
    public updateAccount(data: {
        accountId: string | number,
        name?: string;
        accountType: AccountTypeSet; accountNumber?: string;
        allowExceed?: AllowNegativeBalanceSet;
    }) {
        return http.post<boolean>(`/${this.urlPrefix}/my/updateAccount`, data);
    }

    // 获取当前用户公司信息
    public getCompany() {
        return http.post<CompanyType>(`/${this.urlPrefix}/my/getCompany`).then(res => {
            const company = res as CompanyType;
            if (company) {
                useUserActions().setCompany(company);
            }
            return res;
        });
    }

    public getMyCompanyPermissionList(data?: { permissionType: PermissionTypeSet }) {
        return http.post<PermissionType[]>(`/${this.urlPrefix}/my/getMyCompanyPermissionList`, data);
    }

    public getProfile(data?: { include?: string[] }) {
        data = data || { include: ['*'] };
        return http.post<ProfileType>(`/${this.urlPrefix}/my/getProfile`, data).then(res => {
            const profile = res as ProfileType;
            if (profile) {
                useUserActions().setEmployee(profile.employee!);
                useUserActions().setUser(profile.user!);
                useUserActions().setIsAdmin(profile.isAdmin);
                useUserActions().setIsSuperAdmin(profile.isSuperAdmin);
            }
            return res;
        });
    }

    public getTeams(data?: { include?: string[] }) {
        data = data || { include: ['*'] };
        return http.post<TeamType[]>(`/${this.urlPrefix}/my/getTeams`, data);
    }

    public setAvatar(data: { imageId: string | number }) {
        return http.post<boolean>(`/${this.urlPrefix}/my/setAvatar`, data);
    }

    public setEmployeeMail(data: { oldMail: string; newMail: string; captcha: string; password: string }) {
        return http.post<boolean>(`/${this.urlPrefix}/my/setEmployeeMail`, data);
    }

    public setEmployeeMobile(data: { mobile: string; captcha: string; password: string }) {
        return http.post<boolean>(`/${this.urlPrefix}/my/setEmployeeMobile`, data);
    }
} 