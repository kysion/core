import { http } from "../base";
import { AuditType, PersonalLicenseType, Query, Records } from "@kysion/types";

export class LicensePersonal {
    // 静态方法，用于兼容性
    public static submitLicenseInfo(params: {
        license: PersonalLicenseType;
        UserId?: string | number;
    }) {
        return http.post<boolean>('/license/submitPersonalLicense', {
            ...params.license,
            UserId: params.UserId
        });
    }

    // 获取最新的个人资质审核信息
    public static myPersonLicenseAudit() {
        return http.post<AuditType>('/my/myPersonLicenseAudit');
    }

    // 根据ID获取个人资质|信息
    public static getLicenseById(data: { id: string | number }) {
        return http.post<PersonalLicenseType>(`/person_license/getLicenseById`, data);
    }

    public static queryLicenseList(params: Query) {
        return http.post<Records<PersonalLicenseType>>(`/person_license/queryLicenseList`, params);
    }
}