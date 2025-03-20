import { http } from "../base";
import { Query, Records, TeamType } from "@kysion/types";

export class Team {
    /**
     * 查询团队列表
     */
    public static queryTeamList(params: Query) {
        return http.post<Records<TeamType>>('/team/queryTeamList', params);
    }

    /**
     * 创建团队
     */
    public static createTeam(data: Partial<TeamType> & { name: string }) {
        return http.post<TeamType>('/team/createTeam', data);
    }

    /**
     * 更新团队信息
     */
    public static updateTeam(data: Partial<TeamType> & { id: string | number }) {
        return http.post<TeamType>('/team/updateTeam', data);
    }

    /**
     * 获取团队基本信息
     */
    public static getTeamById(id: string | number) {
        return http.post<TeamType>('/team/getTeamById', { id });
    }

    /**
     * 获取团队详细信息
     */
    public static getTeamDetail(id: string | number) {
        return http.post<TeamType>('/team/getTeamDetail', { id, include: ['*'] });
    }

    /**
     * 设置团队状态
     */
    public static setTeamState(data: { id: string | number; state: number }) {
        return http.post<boolean>('/team/setTeamState', data);
    }

    /**
     * 获取团队成员列表
     */
    public static getTeamMembers(teamId: string | number) {
        return http.post('/team/getTeamMembers', { teamId });
    }

    /**
     * 创建团队邀请码
     */
    public static createInviteCode(teamId: string | number) {
        return http.post<string>('/team/createInviteCode', { teamId });
    }

    /**
     * 通过邀请码加入团队
     */
    public static joinTeamByInviteCode(inviteCode: string) {
        return http.post<boolean>('/team/joinTeamByInviteCode', { inviteCode });
    }
} 