import { http } from "../base";
import { IndustryInfoType, Query, Records } from "@kysion/types";

export class Industry {
    // 获取行业列表
    public static fetchIndustryList(query: Query) {
        return http.post<Records<IndustryInfoType>>('/industry/getIndustryTree', query);
    }

    // 创建行业
    public static createIndustry(data: Partial<IndustryInfoType> & { categoryName: string }) {
        return http.post<IndustryInfoType>('/industry/createIndustry', data);
    }

    // 更新行业
    public static updateIndustry(data: Partial<IndustryInfoType> & { id: number }) {
        return http.post<IndustryInfoType>('/industry/updateIndustry', data);
    }

    // 删除行业
    public static deleteIndustry(data: { id: number }) {
        return http.post<boolean>('/industry/deleteIndustry', data);
    }

    // 获取行业详情
    public static getIndustryById(data: { id: number }) {
        return http.post<IndustryInfoType>('/industry/getIndustryById', data);
    }

    // 获取行业树
    public static getIndustryTree(data: { id: number }) {
        return http.post<IndustryInfoType[]>('/industry/getIndustryTree', data);
    }
}
