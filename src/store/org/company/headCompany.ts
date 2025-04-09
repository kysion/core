import { CompanyInfoType } from "@kysion/types";
import { KysionApis } from "../../../api";
import { IBaseTableStore, createTableModule } from "../../tableModule/tableModule";

// 创建总部公司模块
export const headCompanyModule: IBaseTableStore<CompanyInfoType> = createTableModule<CompanyInfoType>({
    name: 'headCompany',
    getApi: {
        fetchList: (params: any) => KysionApis.Org.HeadCompany.fetchCompanyList(params)
    }
});

// 导出相应的 store, state 和 actions
export const useHeadCompanyStore = headCompanyModule.store;
export const useHeadCompanyState = headCompanyModule.state;
export const useHeadCompanyActions = headCompanyModule.actions;
