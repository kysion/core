import { ApiResponse, Funs } from "@kysion/utils";
import { http } from "../base";
import { MenuItemType, PermissionType, SettingType } from "@kysion/types";

export class MyProfile {
    /**
     * 获取我的权限列表
     */
    public static fetchMyPermission() {
        return http.post<PermissionType[]>('/my/getPermissions');
    }

    /**
     * 修改密码
     */
    public static changePassword(params: { oldPassword: string; newPassword: string }) {
        return http.post<boolean>('/my/updateUserPassword', {
            oldPassword: params.oldPassword,
            password: params.newPassword,
            confirmPassword: params.newPassword
        });
    }

    /**
     * 修改业务手机号
     */
    public static changeBusinessMobile(params: { mobile: string; captcha: string; password: string }) {
        return http.post<boolean>('/my/setMobile', params);
    }

    /**
     * 修改登录手机号
     */
    public static changeLoginMobile(params: { mobile: string; captcha: string }) {
        return http.post<boolean>('/my/setUserMobile', params);
    }

    /**
     * 修改登录邮箱
     */
    public static changeLoginEmail(params: { oldMail: string; newMail: string; captcha: string; password: string }) {
        return http.post<boolean>('/my/setUserMail', params);
    }

    /**
     * 修改用户名
     */
    public static changeUsername(params: { newUsername: string }) {
        return http.post<boolean>('/my/setUserName', params);
    }

    /**
     * 心跳检测
     */
    public static heartbeat() {
        return http.post<boolean>('/my/heartbeat', {
            flagCode: Funs.getEnv('VITE_APP_CLIENT_TYPE', 'web')
        }, {
            skipErrorHandler: true
        });
    }

    /**
     * 获取我的菜单
     */
    public static getMyMenus() {
        return http.post<MenuItemType[]>('/my/getMenus');
    }

    /**
     * 获取设置
     */
    public static getSettingByName<T>(data: { name: string, unionMainId?: React.Key, userId: React.Key }) {

        const response = http.post<SettingType<T>>('/system/frontSettings/getFrontSetting',
            {
                ...data,
                name: `${data.name}`,
                unionMainId: data.unionMainId ?? 0,
                userId: data.userId
            },
            {
                skipErrorHandler: true
            }

        );
        return response.then(res => {
            res = res as SettingType<T>;

            if (!res || res?.values === null) return null;
            res.values = JSON.parse(res.values as string) as T;
            return res;
        }).catch((err) => {
            console.log('err', err);
        });
    }

    /**
     * 更新设置
     */
    public static setSettingByName<T>(data: Partial<SettingType<T> & { name: string, unionMainId?: React.Key, userId: React.Key }>) {

        return http.post<ApiResponse<SettingType<T>>>('/system/frontSettings/saveFrontSetting',
            {
                name: `${data.name}`,
                values: data.values,
                desc: data.desc,
                unionMainId: data.unionMainId ?? 0,
                userId: data.userId,
            }
        );
    }
}
