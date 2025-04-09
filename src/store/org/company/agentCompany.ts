import { CompanyInfoType } from "@kysion/types";
import { KysionApis } from "../../../api";
import { IBaseTableStore, createTableModule } from "../../tableModule/tableModule";

// 创建代理公司模块
export const agentCompanyModule: IBaseTableStore<CompanyInfoType> = createTableModule<CompanyInfoType>({
    name: 'agentCompany',
    getApi: {
        fetchList: (params: any) => KysionApis.Org.Agent.fetchCompanyList(params)
    },
});

// 导出相应的 store, state 和 actions
export const useAgentCompanyStore = agentCompanyModule.store;
export const useAgentCompanyState = agentCompanyModule.state;
export const useAgentCompanyActions = agentCompanyModule.actions;
