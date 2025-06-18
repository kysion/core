import { http } from "../base";
import { MemberLevelType, Records } from "@kysion/types";

export class MemberLevel {
    // 添加会员等级用户
    public static addMemberLevelUser(data: { id: string | number; ids: Array<string | number> }) {
        return http.post<boolean>('/memberLevel/memberLevelConfig/addMemberLevelUser', data);
    }

    // 创建会员等级
    public static createMemberLevel(data: {
        name: string;
        desc?: string;
        identifier: string;
        level?: number;
        rechargeAmount?: number;
        canOrderCount?: number;
        canOrderMaxPrice?: number;
        commissionRate?: number;
        orderDeliveryMinLimitAt?: number;
        orderDeliveryMaxLimitAt?: number;
        orderWaitingMinLimitAt?: number;
        orderWaitingMaxLimitAt?: number;
    }) {
        return http.post<boolean>('/memberLevel/memberLevelConfig/createMemberLevelConfig', data);
    }

    // 删除会员等级
    public static async deleteMemberLevel(data: { id: string | number }) {
        return await http.post<boolean>('/memberLevel/memberLevelConfig/deleteMemberLevel', data) as boolean;
    }

    // 删除会员等级用户
    public static async deleteMemberLevelUser(data: { id: string | number; ids: Array<string | number> }) {
        return await http.post<boolean>('/memberLevel/memberLevelConfig/deleteMemberLevelUser', data) as boolean;
    }

    // 获取会员等级详情
    public static async getMemberLevelById(data: { id: string | number }) {
        return await http.post<MemberLevelType>('/memberLevel/memberLevelConfig/getMemberLevelById', data) as MemberLevelType;
    }

    // 获取会员等级列表
    public static async queryMemberLevelList() {
        return await http.post<MemberLevelType[]>('/memberLevel/memberLevelConfig/queryMemberLevelList') as MemberLevelType[];
    }

    // 获取会员等级列表
    public static async queryMemberLevelUserList(data: { memberLevelId: string | number; }) {
        return await http.post<MemberLevelType[]>('/memberLevel/memberLevelConfig/queryMemberLevelUserList', { id: data.memberLevelId }) as MemberLevelType[];
    }

    // 根据用户ID获取会员等级信息
    public static async getMemberLevelByUserId(data: { userId: string | number; }) {
        return await http.post<MemberLevelType[]>('/memberLevel/memberLevelConfig/queryMemberLevelList', data) as MemberLevelType[];
    }

    // 更新会员等级
    public static updateMemberLevel(data: {
        id: string | number;
        name?: string;
        desc?: string;
        identifier?: string;
        level?: number;
        rechargeAmount?: number;
        canOrderCount?: number;
        canOrderMaxPrice?: number;
        commissionRate?: number;
        orderDeliveryMinLimitAt?: number;
        orderDeliveryMaxLimitAt?: number;
        orderWaitingMinLimitAt?: number;
        orderWaitingMaxLimitAt?: number;
    }) {
        return http.post<boolean>('/memberLevel/memberLevelConfig/updateMemberLevel', data);
    }
}