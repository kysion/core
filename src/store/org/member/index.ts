import { CompanyInfoType } from "@kysion/types";
import { KysionApis } from "../../../api";
import { IBaseTableStore, createTableModule } from "../../tableModule/tableModule";

// 创建总部公司模块
export const memberModule: IBaseTableStore<CompanyInfoType> = createTableModule<CompanyInfoType>({
    name: 'member',
    getApi: {
        fetchList: (params: any) => KysionApis.Org.MemberCustomer.fetchCompanyList(params)
    }
});

// 导出相应的 store, state 和 actions
export const useMemberStore = memberModule.store;
export const useMemberState = memberModule.state;
export const useMemberActions = memberModule.actions;