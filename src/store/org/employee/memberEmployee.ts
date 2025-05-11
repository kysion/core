import { EmployeeInfoType } from "@kysion/types";
import { KysionApis } from "../../../api";
import { IBaseTableStore, createTableModule } from "../../tableModule/tableModule";

// 创建会员客户公司员工模块
export const memberEmployeeModule: IBaseTableStore<EmployeeInfoType> = createTableModule<EmployeeInfoType>({
    name: 'memberEmployee',
    getApi: {
        fetchList: (params: any) => KysionApis.Org.MemberCustomer.employee.queryEmployeeList(params)
    },
});

// 导出相应的 store, state 和 actions
export const useMemberEmployeeStore = memberEmployeeModule.store;
export const useMemberEmployeeState = memberEmployeeModule.state;
export const useMemberEmployeeActions = memberEmployeeModule.actions;
