// 导入必要的API和工具函数
import { KysionApis } from "../../api";
import { createKyStore, createSelectors } from "@kysion/utils";
import { StoreApi, UseBoundStore } from "zustand";
export * from './announcement';
export * from './message';

/**
 * 定义通知状态接口，用于描述通知相关状态的类型
 */
export interface INotifyStateType {
    isLoading: boolean;
    unReadNotifyCount: number;
    unReadAnnouncementCount: number;
    unReadMessageCount: number;
}

// 初始化通知状态
const initialState: INotifyStateType = {
    isLoading: false,
    unReadNotifyCount: 0,
    unReadAnnouncementCount: 0,
    unReadMessageCount: 0,
};

// 创建通知状态的存储钩子
export const useNotifyStore: UseBoundStore<StoreApi<INotifyStateType>> = createKyStore<INotifyStateType>(initialState);

// 创建并导出通知状态的选择器钩子
export const useNotifyState: UseBoundStore<StoreApi<INotifyStateType>> = createSelectors(useNotifyStore);

/**
 * 创建并导出通知相关的操作函数
 * 包含设置加载状态和刷新未读通知数量的操作
 */
export const useNotifyActions = () => {
    const set = useNotifyStore.setState;
    const get = useNotifyStore.getState;

    return {
        // 设置加载状态的函数
        setIsLoading: (isLoading: boolean) => set({ isLoading }),
        // 刷新未读通知数量的异步函数
        refreshUnReadNotifyCount: async () => {
            let NewUnReadNotifyCount = 0;

            // 并行请求未读公告和消息的数量，并更新状态
            await Promise.allSettled([
                KysionApis.Announcement.hasUnReadAnnouncement().then(res => {
                    if (res) {
                        const resData = res as number;
                        set({ unReadNotifyCount: resData });
                        NewUnReadNotifyCount += resData;
                    }
                    return res;
                }),
                KysionApis.Message.hasUnReadMessage().then(res => {
                    if (res) {
                        const resData = res as number;
                        set({ unReadMessageCount: resData });
                        NewUnReadNotifyCount += resData;
                    }
                    return res;
                }),
            ]).then(res => {
                if (res) {
                    if (NewUnReadNotifyCount !== get().unReadNotifyCount) {
                        set({ unReadNotifyCount: NewUnReadNotifyCount });
                    }
                }
                return res;
            });
        },
    };
};