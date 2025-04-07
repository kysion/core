import { KysionApis } from "../../api";
import { createCompanyModule } from "./baseCompany";

// 创建总公司模块
const headCompanyModule = createCompanyModule({
    name: 'company/headCompany',
    getApi: () => KysionApis.Org.HeadCompany
});

// 导出相应的 store, state 和 actions
export const useHeadCompanyStore = headCompanyModule.store;
export const useHeadCompanyState = headCompanyModule.state;
export const useHeadCompanyActions = headCompanyModule.actions;

// 重新导出基础类型
export type { IBaseCompanyStateType as IHeadCompanyStateType } from "./baseCompany";
