import { http } from "../base";
import { MemberLevelType, Records } from "@kysion/types";

export class MemberLevel {
    // 添加会员等级用户
    public static addMemberLevelUser(data: { id: string | number; ids: Array<string | number> }) {
        return http.post<boolean>('/memberLevel/addMemberLevelUser', data);
    }

    // 创建会员等级
    public static createMemberLevel(data: { name: string; desc?: string; identifier: string; }) {
        return http.post<boolean>('/memberLevel/createMemberLevel', data);
    }

    // 删除会员等级
    public static deleteMemberLevel(data: { id: string | number }) {
        return http.post<boolean>('/memberLevel/deleteMemberLevel', data);
    }

    // 删除会员等级用户
    public static deleteMemberLevelUser(data: { id: string | number; ids: Array<string | number> }) {
        return http.post<boolean>('/memberLevel/deleteMemberLevelUser', data);
    }

    // 获取会员等级详情
    public static getMemberLevelById(data: { id: string | number }) {
        return http.post<MemberLevelType>('/memberLevel/getMemberLevelById', data);
    }

    // 获取会员等级列表
    public static queryMemberLevelList() {
        return http.post<Records<MemberLevelType>>('/memberLevel/queryMemberLevelList');
    }

    // 获取会员等级用户列表
    public static queryMemberLevelUserList(data: { id: string | number; }) {
        return http.post<Records<MemberLevelType>>('/memberLevel/queryMemberLevelUserList', data);
    }

    // 更新会员等级
    public static updateMemberLevel(data: { id: string | number; name?: string; desc?: string; identifier?: string; }) {
        return http.post<boolean>('/memberLevel/updateMemberLevel', data);
    }
} 