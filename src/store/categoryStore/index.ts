import { CategoryType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建分类模块
export const categoryModule: IBaseTableStore<CategoryType> = createTableModule<CategoryType>({
    name: 'category',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.Category.fetchCategoryList(params).then(response => {
                if (response) {
                    return response as Records<CategoryType>;
                }
                return new Records<CategoryType>();
            });
        }
    }
});


// 导出代理公司员工相关 hooks
export const useCategoryStore = categoryModule.store;
export const useCategoryState = categoryModule.state;
export const useCategoryActions = categoryModule.actions;