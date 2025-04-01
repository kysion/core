// 导入必要的类型和工具函数
import { TableParams } from "../../types/table";
import { Query, Records, AnnouncementType } from "@kysion/types";
import { createKyStore, createSelectors } from "@kysion/utils";
import { KysionApis } from "../../api";
import { StoreApi, UseBoundStore } from "zustand";
// 定义公告通知状态的接口
export interface IAnnouncementNotifyStateType {
    isLoading: boolean; // 是否正在加载数据
    queryParams: Query; // 查询参数
    tableParams: TableParams; // 表格参数，包括分页信息
    dataArr: Records<AnnouncementType>; // 公告数据数组
}

// 初始化状态
const initialState: IAnnouncementNotifyStateType = {
    isLoading: false, // 初始加载状态为 false
    queryParams: new Query({ pageNum: 1, pageSize: 20 }), // 默认查询参数，第一页，每页20条
    tableParams: {
        pagination: {
            current: 1, // 当前页码
            pageSize: 20, // 每页显示条数
            showSizeChanger: true, // 是否显示分页大小调整器
            position: ['bottomCenter'], // 分页器位置
            // hideOnSinglePage: true, // 单页时是否隐藏分页器（被注释）
        }
    },
    dataArr: new Records<AnnouncementType>(), // 初始化公告数据为空
};

// 创建公告通知的状态管理 Store
export const useAnnouncementNotifyStore: UseBoundStore<StoreApi<IAnnouncementNotifyStateType>> = createKyStore<IAnnouncementNotifyStateType>(initialState);

// 创建状态选择器，用于获取状态
export const useAnnouncementNotifyState: UseBoundStore<StoreApi<IAnnouncementNotifyStateType>> = createSelectors(useAnnouncementNotifyStore);

// 定义公告通知的操作方法
export const useAnnouncementNotifyActions = () => {
    const set = useAnnouncementNotifyStore.setState; // 设置状态的方法
    const get = useAnnouncementNotifyStore.getState; // 获取状态的方法

    return {
        // 设置加载状态
        setIsLoading: (isLoading: boolean) => set({ isLoading }),

        // 设置查询参数
        setQueryParams: (queryParams: Query) => set({ queryParams }),

        // 设置表格参数（支持部分更新）
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

        // 设置公告数据数组
        setDataArr: (dataArr: Records<AnnouncementType>) => set({ dataArr }),

        // 异步获取公告通知列表
        fetchAnnouncementNotifyList: async (queryParams?: Query) => {
            set({ isLoading: true }); // 开始加载，设置加载状态为 true
            return KysionApis.Announcement.queryAnnouncementListByUser(queryParams ?? get().queryParams).then(res => {
                if (res) {
                    const resData = res as Records<AnnouncementType>; // 将返回结果转换为公告数据类型
                    set({ dataArr: resData }); // 更新公告数据数组

                    // 更新分页参数
                    useAnnouncementNotifyActions().setTableParams({
                        pagination: {
                            ...get().tableParams.pagination,
                            current: resData.pageNum, // 当前页码
                            pageSize: resData.pageSize, // 每页条数
                            total: resData.total, // 总条数
                        },
                    });
                }
                return res;
            }).finally(() => set({ isLoading: false })); // 加载完成，设置加载状态为 false
        }
    }
}