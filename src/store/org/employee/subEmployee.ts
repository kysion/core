import { CompanyInfoType, EmployeeInfoType } from "@kysion/types";
import { KysionApis } from "../../../api";
import { IBaseTableStore, createTableModule } from "../../tableModule/tableModule";

// 创建分公司员工模块
export const subEmployeeModule: IBaseTableStore<EmployeeInfoType> = createTableModule<EmployeeInfoType>({
    name: 'subEmployee',
    getApi: {
        fetchList: (params: any) => KysionApis.Org.SubCompany.employee.queryEmployeeList(params)
    },
});

// 导出分公司员工相关 hooks
export const useSubEmployeeStore = subEmployeeModule.store;
export const useSubEmployeeState = subEmployeeModule.state;
export const useSubEmployeeActions = subEmployeeModule.actions;