import { MemberLevelType, Records } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建代理公司模块
export const memberLevelModule: IBaseTableStore<MemberLevelType> = createTableModule<MemberLevelType>({
    name: 'memberLevel',
    getApi: {
        fetchList: (params: any) => {
            return KysionApis.MemberLevel.queryMemberLevelList().then((res) => {
                if (res != null || res as MemberLevelType[]) {
                    const ret = new Records<MemberLevelType>();
                    ret.records = res as unknown as MemberLevelType[];
                    ret.pageNum = 1;
                    ret.pageSize = ret.records.length;
                    ret.total = ret.records.length;
                    ret.pageTotal = 1;

                    return ret;
                }

                return new Records<MemberLevelType>();
            });
        }
    },
});

// 导出相应的 store, state 和 actions
export const useMemberLevelStore = memberLevelModule.store;
export const useMemberLevelState = memberLevelModule.state;
export const useMemberLevelActions = memberLevelModule.actions;
