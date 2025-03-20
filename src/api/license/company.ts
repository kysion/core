import { http } from "../base";
import { AuditType, CompanyLicenseType, Query, Records } from "@kysion/types";

export class LicenseCompany {
    // 静态方法，用于兼容性
    public static getCompanyById(data: { id: string | number }, skipErrorHandler?: boolean) {
        return http.post<CompanyLicenseType>(`/license/getLicenseById`, data, { skipErrorHandler });
    }

    // 获取最新的主体资质审核信息
    public static getLicenseByUnionMainId(data: { unionMainId: string | number }, skipErrorHandler?: boolean) {
        return http.post<AuditType>(`/license/getLicenseByUnionMainId`, data, { skipErrorHandler });
    }

    // 查询主体资质认证|列表
    public static queryLicenseList(params: Query) {
        return http.post<Records<CompanyLicenseType>>(`/license/queryLicenseList`, params);
    }

    // 提交主体资质|信息
    public static submitCompanyLicense(data: Partial<CompanyLicenseType> & { unionMainId: string | number }) {
        return http.post<boolean>(`/license/submitCompanyLicense`, data);
    }
}
