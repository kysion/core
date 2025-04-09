import { EmployeeInfoType } from "@kysion/types";
import { KysionApis } from "../../../api";
import { IBaseTableStore, createTableModule } from "../../tableModule/tableModule";

// 创建代理公司员工模块
export const agentEmployeeModule: IBaseTableStore<EmployeeInfoType> = createTableModule<EmployeeInfoType>({
    name: 'agentEmployee',
    getApi: {
        fetchList: (params: any) => KysionApis.Org.Agent.employee.queryEmployeeList(params)
    }
});


// 导出代理公司员工相关 hooks
export const useAgentEmployeeStore = agentEmployeeModule.store;
export const useAgentEmployeeState = agentEmployeeModule.state;
export const useAgentEmployeeActions = agentEmployeeModule.actions;