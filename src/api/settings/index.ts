import { useUserActions } from "../../store";
import { http } from "../base";
import { Query, Records, SettingType } from "@kysion/types";

export class Settings {
    public static deleteSetting(data: { id: string | number }) {
        return http.post<boolean>('/system/settings/deleteSetting', data);
    }

    public static getSettingByName<T>(data: Partial<Query> & { name: string }) {
        return http.post<SettingType<T>>('/system/settings/getSettingByName', data, {
            skipErrorHandler: true
        });
    }

    public static querySettingList<T>(params: Query) {
        return http.post<Records<SettingType<T>>>('/system/settings/querySettingList', params);
    }

    public static saveSetting<T>(data: SettingType<T>) {
        return http.post<SettingType<T>>('/system/settings/saveSetting', data);
    }

    public static getModuleConfInfo() {
        return http.post<{ moduleName: string, moduleType: number }>('/system/config/moduleTypeInfo').then(res => {
            let data = res as { moduleName: string, moduleType: number };
            if (data) {
                useUserActions().setModuleConf(data);
            }
            return res;
        });
    }
}
