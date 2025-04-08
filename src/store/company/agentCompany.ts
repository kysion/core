import { KysionApis } from "../../api";
import { createCompanyModule, IBaseCompanyStore } from "./baseCompany";

// 创建代理公司模块
export const agentCompanyModule: IBaseCompanyStore = createCompanyModule({
    name: 'agentCompany',
    getApi: () => KysionApis.Org.Agent
});

// 导出相应的 store, state 和 actions
export const useAgentCompanyStore = agentCompanyModule.store;
export const useAgentCompanyState = agentCompanyModule.state;
export const useAgentCompanyActions = agentCompanyModule.actions;

// 重新导出基础类型
export type { IBaseCompanyStateType as IAgentCompanyStateType } from "./baseCompany";
