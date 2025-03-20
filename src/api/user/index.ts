import { http } from "../base";
import { Query, UserInfoType, UserStatusSet } from "@kysion/types";

export class User {
    // 查看详情
    public static getUserDetail(data: { id: string | number }) {
        return http.post<UserInfoType>('/user/getUserDetail', { ...data, include: ['*'] });
    }

    // 获取用户权限|ID数组
    public static getUserPermissionIds(data: { id: string | number }) {
        return http.post<Array<string | number>>('/user/getUserPermissionIds', data);
    }

    // 获取用户|列表
    public static queryUserList(params: Query & { include?: string[] }) {
        return http.post<UserInfoType>('/user/queryUserList', params);
    }

    // 重置用户密码
    public static resetUserPassword(data: { id: string | number; password: string; confirmPassword: string }) {
        return http.post<boolean>('/user/resetUserPassword', data);
    }

    // 设置用户权限
    public static setUserPermissions(data: { id: string | number; permissionIds: Array<string | number> }) {
        return http.post<boolean>('/user/setUserPermissionIds', data);
    }

    // 设置用户角色
    public static setUserRoles(data: { userId: string | number; roleIds: Array<string | number> }) {
        return http.post<boolean>('/user/setUserRoles', data);
    }

    // 设置用户状态
    public static setUserState(data: { id: string | number; state: UserStatusSet }) {
        return http.post<boolean>('/user/setUserState', data);
    }

    // 更新在线超时设定
    public static updateHeartbeatAt(data: { timeout: number }) {
        return http.post<boolean>('/user/updateHeartbeatAt', { heartbeat_at: data.timeout });
    }
} 