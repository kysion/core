import { ChannelInfoType, Query, Records } from "@kysion/types";
import { KysionApis } from "../../api";
import { IBaseTableStore, createTableModule } from "../tableModule/tableModule";

// 创建渠道模块
export const channelModule: IBaseTableStore<ChannelInfoType> = createTableModule<ChannelInfoType>({
    name: 'channel',
    getApi: {
        fetchList: (params: Query) => {
            return KysionApis.Channel.fetchChannelList(params).then(response => {
                if (response) {
                    return response as Records<ChannelInfoType>;
                }
                return new Records<ChannelInfoType>();
            });
        }
    }
});


// 导出代理公司员工相关 hooks
export const useChannelStore = channelModule.store;
export const useChannelState = channelModule.state;
export const useChannelActions = channelModule.actions;