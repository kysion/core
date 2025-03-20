import { http } from "../base";
import { MessageType, Query, Records } from "@kysion/types";

export class Message {
    public static getMessageById(data: { id: string | number }) {
        return http.post<MessageType>('/message/getMessageById', data);
    }

    public static queryUserMessage(params: Query) {
        return http.post<Records<MessageType>>('/message/getUserMessage', params);
    }

    public static hasUnReadMessage(params?: { type?: number }) {
        return http.post<number>('/message/hasUnReadMessage', params);
    }
} 