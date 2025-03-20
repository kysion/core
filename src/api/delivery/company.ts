import { http } from "../base";
import { DeliveryCompanyType, Query, Records } from "@kysion/types";

export class DeliveryCompany {
    public static createDeliveryCompany(data: DeliveryCompanyType) {
        return http.post<DeliveryCompanyType>('/deliveryCompany/createDeliveryCompany', data);
    }

    public static deleteDeliveryCompany(data: { id: string | number }) {
        return http.post<boolean>('/deliveryCompany/deleteDeliveryCompany', data);
    }

    public static getDeliveryCompanyById(data: { id: string | number }) {
        return http.post<DeliveryCompanyType>('/deliveryCompany/getDeliveryCompanyById', data);
    }

    public static queryDeliveryCompanyList(params: Query) {
        return http.post<Records<DeliveryCompanyType>>('/deliveryCompany/queryDeliveryCompany', params);
    }

    public static updateDeliveryCompany(data: DeliveryCompanyType) {
        return http.post<DeliveryCompanyType>('/deliveryCompany/updateDeliveryCompany', data);
    }
} 