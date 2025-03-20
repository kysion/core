import { http } from "../base";
import { ChannelInfoType, Query, Records } from "@kysion/types";

export class Channel {
    public static fetchChannelList(query: Query) {
        return http.post<Records<ChannelInfoType>>('/platformInfo/queryPlatformInfo', query);
    }

    public static createChannelInfo(data: ChannelInfoType) {
        return http.post<ChannelInfoType>('/platformInfo/createPlatformInfo', data);
    }

    public static updateChannelInfo(data: ChannelInfoType) {
        return http.post<ChannelInfoType>('/platformInfo/updatePlatformInfo', data);
    }

    public static deletePlatformInfo(data: { id: React.Key }) {
        return http.post<boolean>('/platformInfo/deletePlatformInfo', data);
    }

    public static getPlatformInfoById(data: { id: React.Key }) {
        return http.post<ChannelInfoType>('/platformInfo/getPlatformInfoById', data);
    }
}
