import { TeamInfoType } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建代理公司员工模块
export const myTeamModule: IBaseTableStore<TeamInfoType> = createTableModule<TeamInfoType>({
    name: 'myTeam',
    getApi: {
        fetchList: (params: any) => KysionApis.MyCompany.team.queryTeamList(params)
    }
});

export const makeTeamTypeName = (parentTeam?: TeamInfoType) => {

    let typeName = 'kysion.department.moduleName';
    let ownerLabel = 'kysion.team.column.ownerEmployeeId';
    let captainLabel = 'kysion.team.column.captainEmployeeId';

    if (parentTeam?.type === 0) {
        typeName = 'kysion.team.moduleName';
        ownerLabel = 'kysion.team.column.captainEmployeeId';
        captainLabel = 'kysion.team.column.captainEmployeeLeader';
    } else if (parentTeam?.type === 1) {
        typeName = 'kysion.team.group';
        ownerLabel = 'kysion.team.column.captainEmployeeLeader';
        captainLabel = 'kysion.team.column.captainGroupEmployeeId';
    }

    return { typeName, ownerLabel, captainLabel };
}

// 导出代理公司员工相关 hooks
export const useMyTeamStore = myTeamModule.store;
export const useMyTeamState = myTeamModule.state;
export const useMyTeamActions = myTeamModule.actions;