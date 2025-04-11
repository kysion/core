import { IndustryInfoType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

/**
 * 递归排序行业树的所有级别
 * 按照 sort 字段进行升序排序
 */
const sortIndustryTree = (industries: IndustryInfoType[]): IndustryInfoType[] => {
    return [...industries].sort((a, b) => (a.sort || 0) - (b.sort || 0)).map(item => {
        if (item.children && item.children.length > 0) {
            // 创建新的对象，保留所有原始属性
            const newItem = new IndustryInfoType({ ...item });
            // 递归排序子项
            newItem.children = sortIndustryTree(item.children);
            return newItem;
        }
        return item;
    });
};

// 创建行业模块
export const industryModule: IBaseTableStore<IndustryInfoType> = createTableModule<IndustryInfoType>({
    name: 'industry',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.Industry.getIndustryTree({ id: 0 }).then(response => {
                // 处理可能返回 HttpResponse 的情况，确保始终返回 Records 类型
                if (response) {
                    const records = response as IndustryInfoType[];
                    // 对树的所有级别进行排序
                    const sortedRecords = sortIndustryTree(records);
                    const result = new Records<IndustryInfoType>();
                    result.records = sortedRecords;
                    result.total = sortedRecords.length;
                    result.pageNum = 1;
                    result.pageSize = sortedRecords.length;
                    result.pageTotal = 1;
                    return result;
                }
                return new Records<IndustryInfoType>();
            });
        }
    },
});

// 导出相应的 store, state 和 actions
export const useIndustryStore = industryModule.store;
export const useIndustryState = industryModule.state;
export const useIndustryActions = industryModule.actions;
