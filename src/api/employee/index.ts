import { http } from "../base";
import { EmployeeStateSet, EmployeeType, Query, Records } from "@kysion/types";

export class Employee {
    /**
     * 查询员工列表
     */
    public static queryEmployeeList(params: Query) {
        return http.post<Records<EmployeeType>>('/employee/queryEmployeeList', params);
    }

    /**
     * 创建员工
     */
    public static createEmployee(data: Partial<EmployeeType> & { name: string; mobile: string }) {
        return http.post<EmployeeType>('/employee/createEmployee', data);
    }

    /**
     * 更新员工信息
     */
    public static updateEmployee(data: Partial<EmployeeType> & { id: string | number }) {
        return http.post<EmployeeType>('/employee/updateEmployee', data);
    }

    /**
     * 获取员工基本信息
     */
    public static getEmployeeById(id: string | number) {
        return http.post<EmployeeType>('/employee/getEmployeeById', { id });
    }

    /**
     * 获取员工详细信息
     */
    public static getEmployeeDetail(id: string | number) {
        return http.post<EmployeeType>('/employee/getEmployeeDetail', { id, include: ['*'] });
    }

    /**
     * 设置员工状态
     */
    public static setEmployeeState(data: { id: string | number; state: EmployeeStateSet }) {
        return http.post<boolean>('/employee/setEmployeeState', data);
    }

    /**
     * 分配员工到团队
     */
    public static assignEmployeeToTeam(data: { employeeId: string | number; teamIds: Array<string | number> }) {
        return http.post<boolean>('/employee/assignEmployeeToTeam', data);
    }

    /**
     * 获取员工所属团队列表
     */
    public static getEmployeeTeams(employeeId: string | number) {
        return http.post('/employee/getEmployeeTeams', { employeeId });
    }
} 