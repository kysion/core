import { http } from "../base";
import { Query, Records, RoleInfoType, UserInfoType } from "@kysion/types";

export class Role {
    // 新增角色|信息
    public static createRole(data: { id?: string | number; name: string; isSystem?: boolean; description?: string; }) {
        return http.post<RoleInfoType>('/role/createRole', data);
    }

    // 删除角色
    public static deleteRole(data: { id: string | number }) {
        return http.post<boolean>('/role/deleteRole', data);
    }

    // 根据ID获取角色
    public static getRoleById(data: { id: string | number }) {
        return http.post<RoleInfoType>('/role/getRoleById', data);
    }

    // 根据用户ID获取所有关联角色|列表
    public static getRoleByUserIdList(data: { userId: string | number }) {
        return http.post<Records<RoleInfoType>>('/role/getRoleByUserIdList', data);
    }

    // 获取角色成员Ids|列表
    public static getRoleMemberIdsList(data: { roleId: string | number }) {
        return http.post<Array<string | number>>('/role/getRoleMemberIdsList', data);
    }

    // 获取角色成员|列表
    public static getRoleMemberList(data: { roleId: string | number }) {
        return http.post<Records<UserInfoType>>('/role/getRoleMemberList', data);
    }

    // 获取角色权限Ids
    public static getRolePermissionIds(data: { id: string | number }) {
        return http.post<Array<string | number>>('/role/getRolePermissionIds', data);
    }

    // 获取所有角色|列表
    public static queryRoleList(params: Query) {
        return http.post<Records<RoleInfoType>>('/role/queryRoleList', params);
    }

    // 移除角色成员
    public static removeRoleMember(data: { roleId: string | number; userIds: Array<string | number> }) {
        return http.post<boolean>('/role/removeRoleMember', data);
    }

    // 设置角色成员
    public static setRoleMember(data: { roleId: string | number; userIds: Array<string | number> }) {
        return http.post<boolean>('/role/setRoleMember', data);
    }

    // 设置角色权限
    public static setRolePermissions(data: { id: string | number; permissionIds: Array<string | number> }) {
        return http.post<boolean>('/role/setRolePermissions', data);
    }

    // 更新角色|信息
    public static updateRole(data: { id: string | number; name?: string; isSystem?: boolean; description?: string; }) {
        return http.post<boolean>('/role/updateRole', data);
    }
} 