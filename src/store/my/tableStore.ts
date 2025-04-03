import { fixedStateSet, TableColumnOption } from "../../types/table";
import { createKyStore, createSelectors } from "@kysion/utils";
import { Funs } from "@kysion/utils";
import { KysionApis } from "../../api";
import { useMyProfileStore } from "./userStore";
import { StoreApi } from "zustand/vanilla";
import { UseBoundStore } from "zustand/react";

// 表格配置当前版本，当配置结构变更时更新此版本号
export const TABLE_CONFIG_VERSION = '1.0.0';

export interface IMyTableStateType {
    tableColumnOptionArr: TableColumnOption[];
}

const initialState: IMyTableStateType = {
    tableColumnOptionArr: []
}

export const useTableStore: UseBoundStore<StoreApi<IMyTableStateType>> = createKyStore<IMyTableStateType>(initialState, {
    storageKey: 'myTablePreference',
    crypto: Funs.getEnv('APP_DEBUG_MODE', false, (v) => v === 'false')
});

export const useTableState = createSelectors(useTableStore);

// 使用store实例直接获取用户ID，避免Hook调用
const getCurrentUserId = () => {
    try {
        // 通过store的getState方法直接访问状态
        const { user } = useMyProfileStore.getState();
        return user?.id || 0;
    } catch (error) {
        console.error('获取用户ID失败:', error);
        return 0;
    }
};

// 获取当前公司ID
const getCurrentCompanyId = () => {
    try {
        // 通过store的getState方法直接访问状态
        const { company } = useMyProfileStore.getState();
        return company?.id || 0;
    } catch (error) {
        console.error('获取公司ID失败:', error);
        return 0;
    }
};

// 定义返回类型接口
interface TableActions {
    cleanDuplicateConfigs: () => TableColumnOption[];
    getCurrentUserId: () => React.Key;
    getCurrentCompanyId: () => React.Key;
    getTableConfig: (name: React.Key, defaultTableConfig: TableColumnOption) => TableColumnOption;
    resetTableConfig: (name: React.Key) => void;
    setTableColumnOption: (tableColumnOption: TableColumnOption, callback?: (saveState: boolean) => void) => TableColumnOption;
    getTablePageSize: (name: React.Key) => number;
    setTablePageSize: (name: React.Key, pageSize: number) => void;
    refresh: (userId?: React.Key, unionMainId?: React.Key, callback?: (state: boolean) => void) => Promise<void>;
    saveToRemote: (tableColumnOptionArr?: TableColumnOption[], callback?: (saveState: boolean) => void) => Promise<any>;
    checkConfigUpgrade: (name: React.Key, defaultConfig: TableColumnOption) => Promise<boolean>;
}

export const useTableActions = (): TableActions => {
    const set = useTableStore.setState;
    const get = useTableStore.getState;

    // 清理冗余配置，确保同一个模块只有一个配置项
    const cleanDuplicateConfigs = () => {
        try {
            const tableColumnOptionArr = [...get().tableColumnOptionArr];
            // 用于跟踪已处理的模块
            const processedModules = new Set();
            // 要保留的配置项
            const cleanedConfigs = [];
            // 记录被移除的配置
            const removedConfigs = [];

            // 按更新时间倒序，优先保留最新的配置
            const sortedConfigs = [...tableColumnOptionArr].sort((a, b) =>
                (b.updatedAt || 0) - (a.updatedAt || 0)
            );

            for (const config of sortedConfigs) {
                // 从名称中提取模块基本名称，移除可能的后缀如"_column_conf"
                const basicName = config.name;

                if (!processedModules.has(basicName)) {
                    // 这是我们首次遇到这个模块的配置，保留它
                    processedModules.add(basicName);
                    cleanedConfigs.push(config);
                } else {
                    // 这是重复的模块配置，记录下来
                    removedConfigs.push(config);
                }
            }

            // 如果发现了冗余配置，更新状态
            if (removedConfigs.length > 0) {
                console.warn(`发现并移除${removedConfigs.length}个冗余配置项:`, removedConfigs.map(c => c.name));
            }

            return cleanedConfigs;
        } catch (error) {
            console.error('清理冗余配置失败:', error);
            return get().tableColumnOptionArr;
        }
    };

    // 初始化时执行一次清理
    cleanDuplicateConfigs();

    return {
        /**
         * 清理冗余的表格配置
         * @returns 清理后的配置数组
         */
        cleanDuplicateConfigs,

        /**
         * 获取当前用户ID
         * @returns 用户ID
         */
        getCurrentUserId,

        /**
         * 获取当前公司ID
         * @returns 公司ID
         */
        getCurrentCompanyId,

        /**
         * 获取指定表格的配置
         * @param name 表格标识符
         * @returns 表格配置
         */
        getTableConfig(name: React.Key, defaultTableConfig: TableColumnOption) {
            // 规范化表格标识符
            const normalizedName = String(name).replace(/_column_conf$/, '');
            const standardName = `${normalizedName}_column_conf`;

            const tableColumnOptionArr = get().tableColumnOptionArr
            // 先从本地存储中查找
            const config = tableColumnOptionArr.find(item => item.name === standardName);
            if (config && config.isDeleted !== true) {
                return config;
            }

            defaultTableConfig.columnOptionArr = defaultTableConfig.columnOptionArr.map(item => {
                return {
                    ...item,
                    fixed: item.name === 'operation' ? fixedStateSet.Right : item.fixed
                }
            });

            if (true === defaultTableConfig.isDeleted) {
                return defaultTableConfig;
            }

            useTableActions().setTableColumnOption(defaultTableConfig);

            return defaultTableConfig;
        },

        resetTableConfig(name: React.Key) {
            const tableColumnOptionArr = get().tableColumnOptionArr;
            const index = tableColumnOptionArr.findIndex(item => item.name === name);
            if (index > -1) {
                tableColumnOptionArr[index].isDeleted = true;
                useTableActions().setTableColumnOption(tableColumnOptionArr[index]);
            }
        },

        /**
         * 设置表格列配置
         * @param tableColumnOption 表格列配置
         * @returns Promise
         */
        setTableColumnOption(tableColumnOption: TableColumnOption, callback?: (saveState: boolean) => void) {
            try {
                const now = Date.now();

                // 规范化表格标识符
                let name = tableColumnOption.name;
                const normalizedName = name.toString().replace(/_column_conf$/, '');
                const standardName = `${normalizedName}_column_conf`;

                // 确保配置使用标准名称
                tableColumnOption.name = standardName;

                // 添加版本和时间戳信息
                const updatedConfig = {
                    ...tableColumnOption,
                    version: TABLE_CONFIG_VERSION,
                    updatedAt: now,
                    pageSize: tableColumnOption.pageSize || 20,
                    source: 'local' as const
                };

                const tableColumnOptionArr = get().tableColumnOptionArr.filter(item => item.isDeleted !== true);

                // 查找并更新或添加配置
                const index = tableColumnOptionArr.findIndex(item => item.name === standardName);

                if (index > -1) {
                    // 更新现有配置
                    tableColumnOptionArr[index] = updatedConfig;
                } else {
                    // 添加新配置
                    tableColumnOptionArr.push(updatedConfig);
                }

                // 保存到后端
                useTableActions().saveToRemote(tableColumnOptionArr, callback);
            } catch (error) {
                console.error('设置表格配置失败:', error, tableColumnOption);
            }
            return tableColumnOption
        },

        /**
         * 获取表格页面大小
         * @param name 表格标识符
         * @returns 页面大小
         */
        getTablePageSize(name: React.Key) {
            return get()
                .tableColumnOptionArr.find(item => item.name === name)?.pageSize ?? 20;
        },

        /**
         * 设置表格页面大小
         * @param name 表格标识符
         * @param pageSize 页面大小
         */
        setTablePageSize(name: React.Key, pageSize: number) {
            const tableColumnOptionArr = [...get().tableColumnOptionArr];
            const index = tableColumnOptionArr.findIndex(item => item.name === name);

            if (index > -1) {
                tableColumnOptionArr[index] = {
                    ...tableColumnOptionArr[index],
                    pageSize,
                    updatedAt: Date.now()
                };

                useTableActions().setTableColumnOption(tableColumnOptionArr[index]);
            }
        },

        /**
         * 从后端重新加载所有表格配置
         */
        async refresh(userId?: React.Key, unionMainId?: React.Key, callback?: (state: boolean) => void) {
            try {
                const currentUserId = userId || getCurrentUserId();
                const currentCompanyId = unionMainId || getCurrentCompanyId();
                const result = await KysionApis.MyProfile.getSettingByName<TableColumnOption[]>({
                    name: 'my_table_setting',
                    userId: currentUserId,
                    unionMainId: currentCompanyId
                }) ?? { values: [] };

                if (result?.values) {

                    if (typeof result.values === 'string') {
                        result.values = JSON.parse(result.values) ?? [];
                    }

                    if (result.values === null) {
                        result.values = [];
                    }

                    // 更新时间戳和来源标记
                    const updatedConfigs = result.values.map(config => ({
                        ...config,
                        updatedAt: Date.now(),
                        source: 'remote' as const,
                        // 保持原有版本不变
                        version: config.version || TABLE_CONFIG_VERSION
                    }));

                    useTableActions().saveToRemote(updatedConfigs, callback);
                }
            } catch (error) {
                console.error('刷新表格配置失败:', error);
            }
        },

        /**
         * 保存所有表格配置到后端
         */
        async saveToRemote(tableColumnOptionArr?: TableColumnOption[], callback?: (saveState: boolean) => void) {
            const userId = getCurrentUserId();
            const unionMainId = getCurrentCompanyId();

            tableColumnOptionArr = tableColumnOptionArr ?? get().tableColumnOptionArr

            // 清理冗余配置
            cleanDuplicateConfigs();

            set({ tableColumnOptionArr });

            return KysionApis.MyProfile.setSettingByName<TableColumnOption[]>({
                name: 'my_table_setting',
                values: tableColumnOptionArr,
                desc: '我的表格设置',
                userId,
                unionMainId
            }).then(res => {
                callback?.(res ? true : false);
            });
        },

        /**
         * 检查配置版本，如果需要升级则更新配置
         * @param name 表格标识符 
         * @param defaultConfig 默认配置
         * @returns 是否进行了更新
         */
        async checkConfigUpgrade(name: React.Key, defaultConfig: TableColumnOption): Promise<boolean> {
            const normalizedName = name.toString().replace(/_column_conf$/, '');
            const standardName = `${normalizedName}_column_conf`;

            // 确保defaultConfig使用标准名称
            defaultConfig.name = standardName;

            try {
                // 从本地获取配置
                const tableColumnOptionArr = [...get().tableColumnOptionArr];
                const tableColumnOptionConfigIndex = tableColumnOptionArr.findIndex(item => standardName === item.name);

                // 如果本地没有配置，直接返回
                if (tableColumnOptionConfigIndex === -1) {
                    return false;
                }

                const tableColumnOptionConfig = tableColumnOptionArr[tableColumnOptionConfigIndex];

                // 检查版本是否需要升级
                if (!tableColumnOptionConfig.version || tableColumnOptionConfig.version !== TABLE_CONFIG_VERSION) {
                    // 重置配置
                    useTableActions().setTableColumnOption(defaultConfig);
                    return true;
                }

                // 不需要升级
                return false;
            } catch (error) {
                console.error('检查配置版本失败:', error);
                return false;
            }
        },
    }
}
