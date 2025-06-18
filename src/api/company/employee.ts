import { http } from "../base";
import { EmployeeInfoType, Query, Records } from "@kysion/types";
import { EmployeeStateSet } from "@kysion/types";

export class KysionEmployee {
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

    // 创建员工|信息
    public createEmployee(data: Partial<EmployeeInfoType> & { name: string; }) {
        return http.post<EmployeeInfoType>(`/${this.urlPrefix}/employee/createEmployee`, data);
    }

    // 删除员工|信息
    public async deleteEmployee(data: { id: string | number }) {
        return await http.post<boolean>(`/${this.urlPrefix}/employee/deleteEmployee`, data) as boolean;
    }

    // 根据ID获取员工|信息
    public getEmployeeById(param: { id: string | number, include?: string[] }) {
        return http.post<EmployeeInfoType>(`/${this.urlPrefix}/employee/getEmployeeById`, param);
    }

    // 获取员工详情|信息
    public getEmployeeDetail(param: { id: string | number, include?: string[] }) {
        param.include = param.include || ['*'];
        return http.post<EmployeeInfoType>(`/${this.urlPrefix}/employee/getEmployeeDetailById`, param);
    }

    // 根据角色ID获取所有所属员工|列表
    public getEmployeeListByRoleId(param: { roleId: string | number, include?: string[], isExport: boolean }) {
        return http.post<Records<EmployeeInfoType>>(`/${this.urlPrefix}/employee/getEmployeeListByRoleId`, {
            id: param.roleId,
            include: param.include
        });
    }

    // 判断名称是否存在
    public hasEmployeeByName(param: { name: string; unionMainId?: string | number, excludeId?: (string | number)[] }) {
        return http.post<boolean>(`/${this.urlPrefix}/employee/hasEmployeeByName`, param);
    }

    // 判断工号是否存在
    public async hasEmployeeByNo(param: { no: string; excludeId?: (string | number)[] }) {
        return await http.post<boolean>(`/${this.urlPrefix}/api/partner/employee/hasEmployeeByNo`, param) as boolean;
    }

    // 查询员工|列表
    public async queryEmployeeList(params: Query) {
        if (!params.include || params.include.length === 0) {
            params.include = ['*'];
        }
        console.log('params', params);
        const response = await http.post<Records<EmployeeInfoType>>(`/${this.urlPrefix}/employee/queryEmployeeList`, params);
        if (response) {
            return response as Records<EmployeeInfoType>;
        }
        return new Records<EmployeeInfoType>();
    }

    // 设置员工角色
    public async setEmployeeRole(params: { userId: string | number, roleIds: (string | number)[] }) {
        return await http.post<boolean>(`/${this.urlPrefix}/employee/setEmployeeRoles`, params) as boolean;
    }

    // 设置员工状态
    public async setEmployeeState(params: { id: string | number, state: EmployeeStateSet }) {
        return await http.post<boolean>(`/${this.urlPrefix}/employee/setEmployeeState`, params) as boolean;
    }

    // 更新员工|信息
    public updateEmployee(data: Partial<EmployeeInfoType> & { name: string; }) {
        return http.post<EmployeeInfoType>(`/${this.urlPrefix}/employee/updateEmployee`, data);
    }

    /**
     * 设置佣金比例
     */
    public async setCommissionRate(data: { userId: string | number; commissionRate: number }) {
        return await http.post<boolean>(`/${this.urlPrefix}/employee/setCommissionRate`, data) as boolean;
    }
}
