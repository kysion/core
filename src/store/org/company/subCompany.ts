import { CompanyInfoType } from "@kysion/types";
import { KysionApis } from "../../../api";
import { IBaseTableStore, createTableModule } from "../../tableModule/tableModule";

// 创建分公司模块
export const subCompanyModule: IBaseTableStore<CompanyInfoType> = createTableModule<CompanyInfoType>({
    name: 'subCompany',
    getApi: {
        fetchList: (params: any) => KysionApis.Org.SubCompany.fetchCompanyList(params)
    }
});

// 导出相应的 store, state 和 actions
export const useSubCompanyStore = subCompanyModule.store;
export const useSubCompanyState = subCompanyModule.state;
export const useSubCompanyActions = subCompanyModule.actions;
