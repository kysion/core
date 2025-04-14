
import { DeliveryInfoType, Query, Records } from "@kysion/types";
import { http } from "../base";

export class Delivery {
    public static createDelivery(data: DeliveryInfoType) {
        return http.post<DeliveryInfoType>('/delivery/createDelivery', data);
    }

    public static deleteDelivery(data: { id: string | number }) {
        return http.post<boolean>('/delivery/deleteDelivery', data);
    }

    public static getDeliveryById(data: { id: string | number }) {
        return http.post<DeliveryInfoType>('/delivery/getDeliveryById', data);
    }

    public static queryDeliveryList(params: Query) {
        return http.post<Records<DeliveryInfoType>>('/delivery/queryDelivery', params);
    }

    public static updateDelivery(data: DeliveryInfoType) {
        return http.post<DeliveryInfoType>('/delivery/updateDelivery', data);
    }
} 