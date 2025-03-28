// 导入必要的类型定义
import { TableParams } from "../../types/table";
import { Query, Records, MessageType } from "@kysion/types";
// 导入创建store的函数
import { createKyStore, createSelectors } from "../base";
// 导入API接口
import { KysionApis } from "../../api";

// 定义消息通知模块的状态接口
export interface IMessageNotifyStateType {
    isLoading: boolean;
    queryParams: Query;
    tableParams: TableParams;
    dataArr: Records<MessageType>;
}

// 初始化状态
const initialState: IMessageNotifyStateType = {
    isLoading: false,
    queryParams: new Query({ pageNum: 1, pageSize: 20 }),
    tableParams: {
        pagination: {
            current: 1,
            pageSize: 20,
            showSizeChanger: true,
            position: ['bottomCenter'],
            // hideOnSinglePage: true,
        }
    },
    dataArr: new Records<MessageType>(),
};

// 创建消息通知模块的store
export const useMessageNotifyStore = createKyStore<IMessageNotifyStateType>(initialState);
// 创建消息通知模块的状态选择器
export const useMessageNotifyState = createSelectors(useMessageNotifyStore);

// 创建消息通知模块的动作
export const useMessageNotifyActions = () => {
    const set = useMessageNotifyStore.setState;
    const get = useMessageNotifyStore.getState;

    // 返回一系列更新状态的函数
    return {
        setIsLoading: (isLoading: boolean) => set({ isLoading }),
        setQueryParams: (queryParams: Query) => set({ queryParams }),
        setTableParams: (tableParams: Partial<TableParams>) => set({
            tableParams: {
                ...get().tableParams,
                ...tableParams,
                pagination: {
                    ...get().tableParams.pagination,
                    ...tableParams.pagination
                }
            }
        }),
        setDataArr: (dataArr: Records<MessageType>) => set({ dataArr }),
        // 获取消息通知列表的函数
        fetchMessageNotifyList: async (queryParams?: Query) => {
            set({ isLoading: true });
            return KysionApis.Message.queryUserMessage(queryParams ?? get().queryParams).then(res => {
                if (res) {
                    const resData = res as Records<MessageType>;
                    set({ dataArr: resData });

                    useMessageNotifyActions().setTableParams({
                        pagination: {
                            ...get().tableParams.pagination,
                            current: resData.pageNum,
                            pageSize: resData.pageSize,
                            total: resData.total,
                        },
                    });

                    return resData;
                }

                return new Records<MessageType>();
            }).finally(() => set({ isLoading: false }));
        }
    }
}