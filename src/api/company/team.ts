import { http } from "../base";
import { InviteCodeType, Query, Records, TeamType } from "@kysion/types";

export class Team {
    private urlPrefix: string;
    public constructor(params: { urlPrefix: string }) {
        this.urlPrefix = params.urlPrefix;
    }

    public setUrlPrefix(urlPrefix: string) {
        this.urlPrefix = urlPrefix;
    }

    public getPrefix() {
        return this.urlPrefix;
    }

    // 创建团队或小组｜信息
    public createTeam(data: {
        id: string | number;
        name?: string;
        ownerEmployeeId?: string | number;
        captainEmployeeId?: string | number;
        parentId?: string | number;
        remark?: string;
        include?: string[];
    }) {
        return http.post<TeamType>(`/${this.urlPrefix}/team/createTeam`, data);
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

    // 根据ID获取团队或小组｜信息
    public getTeamById(data: { id: string | number; include?: string[] }) {
        return http.post<TeamType>(`/${this.urlPrefix}/team/getTeamById`, data);
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

    // 查询团队或小组｜列表
    public queryTeamList(params: Query) {
        return http.post<Records<TeamType>>(`/${this.urlPrefix}/team/queryTeamList`, params);
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

    // 更新团队或小组｜信息
    public updateTeam(data: { id: string | number; name?: string; remark?: string; include?: string[] }) {
        return http.post<TeamType>(`/${this.urlPrefix}/team/updateTeam`, data);
    }
} 