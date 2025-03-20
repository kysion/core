import { http } from "../base";
import { EmployeeStateSet, EmployeeType, Query, Records } from "@kysion/types";

export class KysionEmployee {
    protected urlPrefix: string;

    constructor(params: { urlPrefix: string }) {
        this.urlPrefix = params.urlPrefix || 'company';
    }

    /**
     * 查询员工列表
     */
    public queryEmployeeList(params: Query) {
        return http.post<Records<EmployeeType>>(`/${this.urlPrefix}/queryEmployeeList`, params);
    }

    /**
     * 创建员工
     */
    public createEmployee(data: Partial<EmployeeType> & { name: string; mobile: string }) {
        return http.post<EmployeeType>(`/${this.urlPrefix}/createEmployee`, data);
    }

    /**
     * 更新员工信息
     */
    public updateEmployee(data: Partial<EmployeeType> & { id: string | number }) {
        return http.post<EmployeeType>(`/${this.urlPrefix}/updateEmployee`, data);
    }

    /**
     * 获取员工基本信息
     */
    public getEmployeeById(id: string | number) {
        return http.post<EmployeeType>(`/${this.urlPrefix}/getEmployeeById`, { id });
    }

    /**
     * 获取员工详细信息
     */
    public getEmployeeDetail(id: string | number) {
        return http.post<EmployeeType>(`/${this.urlPrefix}/getEmployeeDetail`, { id, include: ['*'] });
    }

    /**
     * 设置员工状态
     */
    public setEmployeeState(data: { id: string | number; state: EmployeeStateSet }) {
        return http.post<boolean>(`/${this.urlPrefix}/setEmployeeState`, data);
    }

    /**
     * 分配员工到团队
     */
    public assignEmployeeToTeam(data: { employeeId: string | number; teamIds: Array<string | number> }) {
        return http.post<boolean>(`/${this.urlPrefix}/assignEmployeeToTeam`, data);
    }

    /**
     * 获取员工所属团队列表
     */
    public getEmployeeTeams(employeeId: string | number) {
        return http.post(`/${this.urlPrefix}/getEmployeeTeams`, { employeeId });
    }
}
