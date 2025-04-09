import { EmployeeInfoType } from "@kysion/types";
import { KysionApis } from "../../../api";
import { IBaseTableStore, createTableModule } from "../../tableModule/tableModule";

// 创建总部公司模块
export const headEmployeeModule: IBaseTableStore<EmployeeInfoType> = createTableModule<EmployeeInfoType>({
    name: 'headEmployee',
    getApi: {
        fetchList: (params: any) => KysionApis.Org.HeadCompany.employee.queryEmployeeList(params)
    },
});

// 导出相应的 store, state 和 actions
export const useHeadEmployeeStore = headEmployeeModule.store;
export const useHeadEmployeeState = headEmployeeModule.state;
export const useHeadEmployeeActions = headEmployeeModule.actions;
