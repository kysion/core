import { http } from "../base";
import { CompanyStateSet, CompanyInfoType, Query, Records } from "@kysion/types";
import { My } from "./my";
import { Financial } from "./financial";
import { KysionEmployee } from "./employee";
import { Team } from "./team";

// 保存Company实例的映射
export const companyMap: Record<string, Company> = {};

export class Company {
    protected urlPrefix: string;
    public readonly my: My;
    public readonly financial: Financial;
    public readonly employee: KysionEmployee;
    public readonly team: Team;

    constructor(params: { urlPrefix: string }) {
        this.urlPrefix = params.urlPrefix || 'company';
        this.my = new My({ urlPrefix: this.urlPrefix });
        this.financial = new Financial({ urlPrefix: this.urlPrefix });
        this.employee = new KysionEmployee({ urlPrefix: this.urlPrefix });
        this.team = new Team({ urlPrefix: this.urlPrefix });

        companyMap[this.urlPrefix] = this;
    }

    /**
     * 获取前缀
     */
    public getPrefix() {
        return this.urlPrefix;
    }

    /**
     * 设置URL前缀
     * @param urlPrefix 
     */
    public setUrlPrefix(urlPrefix: string) {
        this.urlPrefix = urlPrefix;
        this.my.setUrlPrefix(urlPrefix);
        this.financial.setUrlPrefix(urlPrefix);
        this.employee.setUrlPrefix(urlPrefix);
        this.team.setUrlPrefix(urlPrefix);
    }

    /**
     * 查询企业列表
     */
    public fetchCompanyList(params: Query) {
        return http.post<Records<CompanyInfoType>>(`/${this.urlPrefix}/queryCompanyList`, params);
    }

    /**
     * 创建企业
     */
    public createCompany(data: Partial<CompanyInfoType> & { name: string; contactName: string }) {
        return http.post<CompanyInfoType>(`/${this.urlPrefix}/createCompany`, data);
    }

    /**
     * 更新企业信息
     */
    public upgradeCompany(data: Partial<CompanyInfoType> & { name: string; contactName: string }) {
        return http.post<CompanyInfoType>(`/${this.urlPrefix}/updateCompany`, data);
    }

    /**
     * 获取企业基本信息
     */
    public getCompanyById(id: string | number) {
        return http.post<CompanyInfoType>(`/${this.urlPrefix}/getCompanyById`, { id });
    }

    /**
     * 获取企业详细信息
     */
    public getCompanyDetail(id: string | number) {
        return http.post<CompanyInfoType>(`/${this.urlPrefix}/getCompanyDetail`, { id, include: ['*'] });
    }

    /**
     * 检查企业名称是否存在
     */
    public hasCompanyByName(name: string) {
        return http.post<CompanyInfoType>(`/${this.urlPrefix}/hasCompanyByName`, { name });
    }

    /**
     * 设置企业状态
     */
    public setCompanyState(data: { id: string | number; state: CompanyStateSet }) {
        return http.post<boolean>(`/${this.urlPrefix}/setCompanyState`, data);
    }
}