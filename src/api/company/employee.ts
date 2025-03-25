import { http } from "../base";
import { EmployeeType, Query, Records } from "@kysion/types";
import { EmployeeStateSet } from "@kysion/types";

export class KysionEmployee {
    private urlPrefix: string;
    constructor(params: { urlPrefix: string }) {
        this.urlPrefix = params.urlPrefix;
    }

    // 创建员工|信息
    public createEmployee(data: Partial<EmployeeType> & { name: string; }) {
        return http.post<EmployeeType>(`/${this.urlPrefix}/employee/createEmployee`, data);
    }

    // 删除员工|信息
    public deleteEmployee(data: { id: string | number }) {
        return http.post<boolean>(`/${this.urlPrefix}/employee/deleteEmployee`, data);
    }

    // 根据ID获取员工|信息
    public getEmployeeById(param: { id: string | number, include?: string[] }) {
        return http.post<EmployeeType>(`/${this.urlPrefix}/employee/getEmployeeById`, param);
    }

    // 获取员工详情|信息
    public getEmployeeDetail(param: { id: string | number, include?: string[] }) {
        return http.post<EmployeeType>(`/${this.urlPrefix}/employee/getEmployeeDetailById`, param);
    }

    // 根据角色ID获取所有所属员工|列表
    public getEmployeeListByRoleId(param: { roleId: string | number, include?: string[], isExport: boolean }) {
        return http.post<Records<EmployeeType>>(`/${this.urlPrefix}/employee/getEmployeeListByRoleId`, {
            id: param.roleId,
            include: param.include
        });
    }

    // 判断名称是否存在
    public hasEmployeeByName(param: { name: string; unionMainId?: string | number, excludeId?: (string | number)[] }) {
        return http.post<boolean>(`/${this.urlPrefix}/employee/hasEmployeeByName`, param);
    }

    // 判断工号是否存在
    public hasEmployeeByNo(param: { no: string; excludeId?: (string | number)[] }) {
        return http.post<boolean>(`/${this.urlPrefix}/api/partner/employee/hasEmployeeByNo`, param);
    }

    // 查询员工|列表
    public queryEmployeeList(params: Query) {
        if (!params.include) {
            params.include = ['*'];
        }
        return http.post<Records<EmployeeType>>(`/${this.urlPrefix}/employee/queryEmployeeList`, params);
    }

    // 设置员工角色
    public setEmployeeRole(params: { userId: string | number, roleIds: (string | number)[] }) {
        return http.post<boolean>(`/${this.urlPrefix}/employee/setEmployeeRoles`, params);
    }

    // 设置员工状态
    public setEmployeeState(params: { id: string | number, state: EmployeeStateSet }) {
        return http.post<boolean>(`/${this.urlPrefix}/employee/setEmployeeState`, params);
    }

    // 更新员工|信息
    public updateEmployee(data: Partial<EmployeeType> & { name: string; }) {
        return http.post<EmployeeType>(`/${this.urlPrefix}/employee/updateEmployee`, data);
    }
}
