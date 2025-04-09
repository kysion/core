import { EmployeeInfoType } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建代理公司员工模块
export const myEmployeeModule: IBaseTableStore<EmployeeInfoType> = createTableModule<EmployeeInfoType>({
    name: 'myEmployee',
    getApi: {
        fetchList: (params: any) => KysionApis.MyCompany.employee.queryEmployeeList(params)
    }
});


// 导出代理公司员工相关 hooks
export const useMyEmployeeStore = myEmployeeModule.store;
export const useMyEmployeeState = myEmployeeModule.state;
export const useMyEmployeeActions = myEmployeeModule.actions;