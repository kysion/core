import { http } from "../base";
import { PermissionType, permissionTypeSet, PermissionTypeSet, Query, Records } from "@kysion/types";

export class Permission {
    public static createPermission(data: PermissionType) {
        return http.post<PermissionType>('/permission/createPermission', data);
    }

    public static deletePermission(data: { id: string | number }) {
        return http.post<boolean>('/permission/deletePermission', data);
    }

    public static getPermissionById(data: { id: string | number }) {
        return http.post<PermissionType>('/permission/getPermissionById', data);
    }

    public static getPermissionByIdentifier(data: { identifier: string }) {
        return http.post<PermissionType>('/permission/getPermissionByIdentifier', data);
    }

    public static getPermissionTree(data?: { id: string | number, type: PermissionTypeSet }) {
        data = data ?? { id: 0, type: permissionTypeSet.API };
        return http.post<PermissionType[]>('/permission/getPermissionTree', data);
    }

    public static queryPermissionList(data: Query) {
        return http.post<Records<PermissionType>>('/permission/queryPermissionList', data);
    }

    public static updatePermission(data: PermissionType) {
        return http.post<PermissionType>('/permission/updatePermission', data);
    }
} 