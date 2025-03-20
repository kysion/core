import { http } from "../base";
import { InviteCodeType, Query, Records, TeamType } from "@kysion/types";

export class Team {
    protected urlPrefix: string;

    constructor(params: { urlPrefix: string }) {
        this.urlPrefix = params.urlPrefix || 'company';
    }

    /**
     * 查询团队列表
     */
    public queryTeamList(params: Query) {
        return http.post<Records<TeamType>>(`/${this.urlPrefix}/queryTeamList`, params);
    }

    /**
     * 创建团队
     */
    public createTeam(data: Partial<TeamType> & { name: string }) {
        return http.post<TeamType>(`/${this.urlPrefix}/createTeam`, data);
    }

    /**
     * 更新团队信息
     */
    public updateTeam(data: Partial<TeamType> & { id: string | number }) {
        return http.post<TeamType>(`/${this.urlPrefix}/updateTeam`, data);
    }

    /**
     * 获取团队基本信息
     */
    public getTeamById(id: string | number) {
        return http.post<TeamType>(`/${this.urlPrefix}/getTeamById`, { id });
    }

    /**
     * 获取团队详细信息
     */
    public getTeamDetail(id: string | number) {
        return http.post<TeamType>(`/${this.urlPrefix}/getTeamDetail`, { id, include: ['*'] });
    }

    /**
     * 设置团队状态
     */
    public setTeamState(data: { id: string | number; state: number }) {
        return http.post<boolean>(`/${this.urlPrefix}/setTeamState`, data);
    }

    /**
     * 获取团队成员列表
     */
    public getTeamMembers(teamId: string | number) {
        return http.post(`/${this.urlPrefix}/getTeamMembers`, { teamId });
    }

    // 删除团队或小组｜信息
    public deleteTeam(data: { id: string | number }) {
        return http.post<boolean>(`/${this.urlPrefix}/team/deleteTeam`, data);
    }

    // 根据团队ID获取成员｜列表
    public getEmployeeListByTeamId(params: {
        teamId: string | number;
        include?: string[];
    }) {
        return http.post<any>(`/${this.urlPrefix}/team/getEmployeeListByTeamId`, params);
    }

    // 查看团队邀约码
    public getTeamInviteCode(data: { teamId: string | number }) {
        return http.post<{ team: TeamType; inviteRes: InviteCodeType }>(`/${this.urlPrefix}/team/getTeamInviteCode`, data);
    }

    // 判断团队名称是否存在
    public hasTeamByName(data: { name: string; unionNameId: string | number; excludeId?: string | number }) {
        return http.post<boolean>(`/${this.urlPrefix}/team/hasTeamByName`, data);
    }

    // 通过邀请码加入团队
    public joinTeamByInviteCode(data: { inviteCode: string }) {
        return http.post<boolean>(`/${this.urlPrefix}/team/joinTeamByInviteCode`, data);
    }

    // 移除团队成员
    public removeTeamMember(data: { teamId: string | number; employeeId: string | number }) {
        return http.post<boolean>(`/${this.urlPrefix}/team/removeTeamMember`, {
            id: data.teamId,
            employeeId: data.employeeId
        });
    }

    // 设置团队队长
    public setTeamCaptain(data: { teamId: string | number; employeeId: string | number }) {
        return http.post<boolean>(`/${this.urlPrefix}/team/setTeamCaptain`, {
            id: data.teamId,
            employeeId: data.employeeId
        });
    }

    // 设置团队成员
    public setTeamMember(data: { teamId: string | number; employeeId: string | number }) {
        return http.post<boolean>(`/${this.urlPrefix}/team/setTeamMember`, {
            id: data.teamId,
            employeeId: data.employeeId
        });
    }

    // 设置团队管理者
    public setTeamOwner(data: { teamId: string | number; employeeId: string | number }) {
        return http.post<boolean>(`/${this.urlPrefix}/team/setTeamOwner`, {
            id: data.teamId,
            employeeId: data.employeeId
        });
    }
} 