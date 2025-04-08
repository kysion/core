import { KysionApis } from "../../api";
import { createCompanyModule } from "./baseCompany";

// 创建分公司模块
export const subCompanyModule = createCompanyModule({
    name: 'subCompany',
    getApi: () => KysionApis.Org.SubCompany
});

// 导出相应的 store, state 和 actions
export const useSubCompanyStore = subCompanyModule.store;
export const useSubCompanyState = subCompanyModule.state;
export const useSubCompanyActions = subCompanyModule.actions;

// 重新导出基础类型
export type { IBaseCompanyStateType as ISubCompanyStateType } from "./baseCompany";
