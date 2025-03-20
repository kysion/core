import { http } from "../base";
import {
    AccountBillDetailType,
    AccountInfoType,
    AccountTypeSet,
    AllowNegativeBalanceSet,
    BankCardType,
    CompanyType,
    EmployeeType,
    InvoiceInfoType,
    PermissionType,
    PermissionTypeSet,
    ProfileType,
    Query,
    Records,
    TeamType,
} from "@kysion/types";

export class My {
    protected urlPrefix: string;

    constructor(params: { urlPrefix: string }) {
        this.urlPrefix = params.urlPrefix || 'company';
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

    /**
     * 获取我的企业信息
     */
    public getMyCompany() {
        return http.post<CompanyType>(`/${this.urlPrefix}/getMyCompany`, {});
    }

    /**
     * 获取我的企业详情
     */
    public getMyCompanyDetail() {
        return http.post<CompanyType>(`/${this.urlPrefix}/getMyCompanyDetail`, { include: ['*'] });
    }

    /**
     * 更新我的企业信息
     */
    public updateMyCompany(data: Partial<CompanyType>) {
        return http.post<CompanyType>(`/${this.urlPrefix}/updateMyCompany`, data);
    }

    /**
     * 获取我的员工信息
     */
    public getMyEmployee() {
        return http.post<EmployeeType>(`/${this.urlPrefix}/getMyEmployee`, {});
    }

    /**
     * 获取我的员工详情
     */
    public getMyEmployeeDetail() {
        return http.post<EmployeeType>(`/${this.urlPrefix}/getMyEmployeeDetail`, { include: ['*'] });
    }

    /**
     * 更新我的员工信息
     */
    public updateMyEmployee(data: Partial<EmployeeType>) {
        return http.post<EmployeeType>(`/${this.urlPrefix}/updateMyEmployee`, data);
    }

    /**
     * 获取我的团队列表
     */
    public getMyTeams() {
        return http.post(`/${this.urlPrefix}/getMyTeams`, {});
    }

    /**
     * 上传企业Logo
     */
    public uploadLogo(fileData: File | Blob) {
        return http.upload<{ id: string | number; url: string }>(`/${this.urlPrefix}/uploadLogo`, fileData);
    }

    public getMyCompanyPermissionList(data?: { permissionType: PermissionTypeSet }) {
        return http.post<PermissionType[]>(`/${this.urlPrefix}/my/getMyCompanyPermissionList`, data);
    }

    public getProfile(data?: { include?: string[] }) {
        data = data || { include: ['*'] };
        return http.post<ProfileType>(`/${this.urlPrefix}/my/getProfile`, data);
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