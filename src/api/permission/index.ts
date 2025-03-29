import { http } from "../base";
import { PermissionType, permissionTypeSet, PermissionTypeSet, Query, Records } from "@kysion/types";

export class Permission {
    // 获取当前用户公司权限树
    public static createPermission(data: PermissionType) {
        return http.post<PermissionType>('/permission/createPermission', data);
    }

    // 删除权限
    public static deletePermission(data: { id: string | number }) {
        return http.post<boolean>('/permission/deletePermission', data);
    }

    // 根据ID获取权限
    public static getPermissionById(data: { id: string | number }) {
        return http.post<PermissionType>('/permission/getPermissionById', data);
    }

    // 根据标识符获取权限
    public static getPermissionByIdentifier(data: { identifier: string }) {
        return http.post<PermissionType>('/permission/getPermissionByIdentifier', data);
    }

    // 获取权限树
    public static getPermissionTree(data?: { id: string | number, type: PermissionTypeSet }) {
        data = data ?? { id: 0, type: permissionTypeSet.API };
        return http.post<PermissionType[]>('/permission/getPermissionTree', data);
    }

    // 查询权限列表
    public static queryPermissionList(data: Query) {
        return http.post<Records<PermissionType>>('/permission/queryPermissionList', data);
    }

    // 更新权限
    public static updatePermission(data: PermissionType) {
        return http.post<PermissionType>('/permission/updatePermission', data);
    }
} 