import { http } from "../base";
import { ChannelInfoType, Query, Records } from "@kysion/types";

export class Channel {
    public static fetchChannelList(query: Query) {
        return http.post<Records<ChannelInfoType>>('/channel/queryChannelInfo', query);
    }

    public static createChannelInfo(data: ChannelInfoType) {
        return http.post<ChannelInfoType>('/channel/createChannelInfo', data);
    }

    public static updateChannelInfo(data: ChannelInfoType) {
        return http.post<ChannelInfoType>('/channel/updateChannelInfo', data);
    }

    public static deleteChannelInfo(data: { id: React.Key }) {
        return http.post<boolean>('/channel/deleteChannelInfo', data);
    }

    public static getChannelInfoById(data: { id: React.Key }) {
        return http.post<ChannelInfoType>('/channel/getChannelInfoById', data);
    }
}
