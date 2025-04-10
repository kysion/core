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


// 导出代理公司员工相关 hooks
export const useMyTeamStore = myTeamModule.store;
export const useMyTeamState = myTeamModule.state;
export const useMyTeamActions = myTeamModule.actions;