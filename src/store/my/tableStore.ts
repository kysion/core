import { TableColumnOption } from "../../types/table";
import { createKyStore, createSelectors } from "@kysion/utils";
import { Funs } from "@kysion/utils";
import { KysionApis } from "../../api";
import { useMyProfileState, useMyProfileStore } from "./userStore";
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

export const useTableActions = () => {
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
                const basicName = config.name.toString().replace(/_column_conf$/, '');

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
                console.warn(`发现并移除${removedConfigs.length}个冗余配置项:`,
                    removedConfigs.map(c => c.name));
                set({ tableColumnOptionArr: cleanedConfigs });
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
         * 直接从后端加载指定表格的配置
         * @param name 表格标识符
         * @returns 表格配置
         */
        async getRemoteConfig(name: React.Key): Promise<TableColumnOption | null> {
            try {
                const userId = getCurrentUserId();
                const unionMainId = getCurrentCompanyId();

                if (!userId) {
                    console.warn('未登录用户无法获取远程配置');
                    return null;
                }

                // 规范化表格标识符
                const normalizedName = name.toString().replace(/_column_conf$/, '');
                const standardName = `${normalizedName}_column_conf`;

                // 从后端获取配置
                console.log(`尝试从后端获取表格配置[${standardName}]`, { userId, unionMainId });
                const remoteSetting = await KysionApis.MyProfile.getSettingByName<TableColumnOption>({
                    name: `table_setting_${standardName}`,
                    userId,
                    unionMainId
                });

                if (!remoteSetting || !remoteSetting.values) {
                    console.warn(`后端没有找到表格配置[${standardName}]`);
                    return null;
                }

                console.log(`成功从后端获取到表格配置[${standardName}]`, remoteSetting.values);

                // 确保columnOptionArr是有效的数组
                if (!remoteSetting.values.columnOptionArr || !Array.isArray(remoteSetting.values.columnOptionArr)) {
                    console.warn(`远程配置的columnOptionArr无效`, remoteSetting.values);
                    return null;
                }

                // 检查每个列配置项，确保它们是有效的
                const validColumnOptions = (remoteSetting.values.columnOptionArr || []).filter(item => {
                    return item && typeof item === 'object';
                });

                if (validColumnOptions.length === 0) {
                    console.warn(`远程配置不包含有效的列配置项`);
                    return null;
                }

                // 标准化配置
                const remoteConfig = {
                    ...remoteSetting.values,
                    name: standardName, // 确保使用标准名称
                    columnOptionArr: validColumnOptions,
                    source: 'remote' as const,
                    version: remoteSetting.values.version || TABLE_CONFIG_VERSION,
                    updatedAt: Date.now()
                };

                console.log(`已处理远程配置，有效配置项: ${validColumnOptions.length}`, remoteConfig);

                // 保存到本地
                const tableColumnOptionArr = [...get().tableColumnOptionArr];

                // 先删除已存在的同名配置
                const filteredArr = tableColumnOptionArr.filter(item => {
                    const itemNormalized = item.name.toString().replace(/_column_conf$/, '');
                    return itemNormalized !== normalizedName;
                });

                // 添加新配置
                filteredArr.push(remoteConfig);

                // 更新本地存储
                set({ tableColumnOptionArr: filteredArr });
                console.log(`远程配置已保存到本地`, remoteConfig);

                return remoteConfig;
            } catch (error) {
                console.error('从后端获取表格配置失败:', error);
                return null;
            }
        },

        /**
         * 设置表格列配置
         * @param tableColumnOption 表格列配置
         * @param isSave 是否保存到后端
         * @returns Promise
         */
        async setTableColumnOption(tableColumnOption: TableColumnOption, isSave: boolean = false) {
            try {
                const now = Date.now();
                const tableColumnOptionArr = [...get().tableColumnOptionArr];

                // 规范化表格标识符
                let name = tableColumnOption.name;
                const normalizedName = name.toString().replace(/_column_conf$/, '');
                const standardName = `${normalizedName}_column_conf`;

                // 确保配置使用标准名称
                tableColumnOption.name = standardName;

                // 确保columnOptionArr是有效的数组
                if (!tableColumnOption.columnOptionArr || !Array.isArray(tableColumnOption.columnOptionArr)) {
                    tableColumnOption.columnOptionArr = [];
                }

                const index = tableColumnOptionArr.findIndex(item => {
                    const itemNormalized = item.name.toString().replace(/_column_conf$/, '');
                    return itemNormalized === normalizedName;
                });

                // 添加版本和时间戳信息
                const updatedConfig = {
                    ...tableColumnOption,
                    version: TABLE_CONFIG_VERSION,
                    updatedAt: now,
                    pageSize: tableColumnOption.pageSize || 20,
                    source: 'local' as const
                };

                console.log(`更新配置[${standardName}]`, updatedConfig);

                if (index > -1) {
                    console.log(`更新现有配置[${standardName}]`);
                    tableColumnOptionArr[index] = updatedConfig;
                } else {
                    console.log(`添加新配置[${standardName}]`);
                    tableColumnOptionArr.push(updatedConfig);
                }

                // 更新本地存储
                set({ tableColumnOptionArr });
                console.log(`配置已保存到本地[${standardName}]`);

                // 如果需要保存到后端，则调用保存接口
                if (isSave) {
                    try {
                        // 获取当前用户ID和公司ID
                        const userId = getCurrentUserId();
                        const unionMainId = getCurrentCompanyId();

                        if (!userId) {
                            console.warn(`未登录用户无法保存配置到后端`);
                            return Promise.resolve({ data: updatedConfig.columnOptionArr, error: "未登录用户无法保存配置", success: false });
                        }

                        console.log(`正在保存配置到后端[${standardName}]`, { userId, unionMainId });
                        // 只保存当前表格的配置
                        await KysionApis.MyProfile.setSettingByName<TableColumnOption>({
                            name: `table_setting_${standardName}`,
                            values: updatedConfig,
                            desc: `表格配置-${standardName}`,
                            userId,
                            unionMainId
                        });
                        console.log(`表格配置已保存到后端: ${standardName}`);
                    } catch (error) {
                        console.error('保存表格配置到后端失败:', error);
                    }
                }

                return Promise.resolve({ data: updatedConfig.columnOptionArr, error: undefined, success: true });
            } catch (error) {
                console.error('设置表格配置失败:', error);
                return Promise.resolve({ data: [], error: error as any, success: false });
            }
        },

        /**
         * 获取表格列配置
         * @param name 表格标识符
         * @returns 表格列配置数组
         */
        getTableColumnOption(name: React.Key) {
            // 规范化表格标识符，移除可能的后缀
            const normalizedName = name.toString().replace(/_column_conf$/, '');

            // 先尝试查找完全匹配的配置
            let localConfig = get().tableColumnOptionArr.find(item =>
                item.name === name || item.name === `${normalizedName}_column_conf`
            );

            // 如果没有完全匹配，尝试基本名称匹配
            if (!localConfig) {
                localConfig = get().tableColumnOptionArr.find(item =>
                    item.name.toString().replace(/_column_conf$/, '') === normalizedName
                );
            }

            // 如果本地存在配置，直接返回
            if (localConfig) {
                return localConfig.columnOptionArr.sort((a, b) => a.sort - b.sort);
            }

            // 本地没有配置，返回空数组
            // 注意：实际加载配置的工作应由initTableConfig完成
            console.log(`本地无配置[${name}]，应使用initTableConfig初始化`);
            return [];
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

                set({ tableColumnOptionArr });

                // 获取当前用户ID和公司ID
                const userId = getCurrentUserId();
                const unionMainId = getCurrentCompanyId();

                // 更新后端配置
                KysionApis.MyProfile.setSettingByName<TableColumnOption>({
                    name: `table_setting_${name}`,
                    values: tableColumnOptionArr[index],
                    desc: `表格配置-${name}`,
                    userId,
                    unionMainId
                }).catch(error => {
                    console.error('保存页面大小到后端失败:', error);
                });
            }
        },

        /**
         * 初始化表格配置
         * @param name 表格标识符
         * @param defaultConfig 默认配置
         */
        async initTableConfig(name: React.Key, defaultConfig: TableColumnOption) {
            try {
                // 规范化表格标识符
                const normalizedName = name.toString().replace(/_column_conf$/, '');
                const standardName = `${normalizedName}_column_conf`;

                // 使用标准化的名称修改defaultConfig
                defaultConfig.name = standardName;

                const userId = getCurrentUserId();
                const unionMainId = getCurrentCompanyId();

                // 执行一次冗余配置清理
                cleanDuplicateConfigs();

                const tableColumnOptionArr = [...get().tableColumnOptionArr];

                // 查找所有与当前表格相关的配置
                const relatedConfigs = tableColumnOptionArr.filter(item =>
                    item.name === standardName ||
                    item.name === normalizedName ||
                    item.name.toString().replace(/_column_conf$/, '') === normalizedName
                );

                // 如果已存在相关配置，使用最新的一个
                if (relatedConfigs.length > 0) {
                    // 按更新时间排序
                    const sortedConfigs = relatedConfigs.sort((a, b) =>
                        (b.updatedAt || 0) - (a.updatedAt || 0)
                    );

                    const latestConfig = sortedConfigs[0];

                    // 如果不是标准命名，重命名并更新
                    if (latestConfig.name !== standardName) {
                        console.log(`发现非标准命名配置[${latestConfig.name}]，已重命名为[${standardName}]`);

                        // 删除所有相关配置
                        const newTableColumnOptionArr = tableColumnOptionArr.filter(item =>
                            !relatedConfigs.includes(item)
                        );

                        // 使用标准名称添加最新配置
                        const updatedConfig = {
                            ...latestConfig,
                            name: standardName,
                            updatedAt: Date.now()
                        };

                        newTableColumnOptionArr.push(updatedConfig);
                        set({ tableColumnOptionArr: newTableColumnOptionArr });

                        return updatedConfig.columnOptionArr.sort((a, b) => a.sort - b.sort);
                    }

                    // 已经是标准命名，直接返回
                    return latestConfig.columnOptionArr.sort((a, b) => a.sort - b.sort);
                }

                // 本地没有配置，检查远程配置
                console.log(`本地无配置，正在从远程获取[${standardName}]的配置`);

                // 尝试从后端获取配置
                const remoteSetting = await KysionApis.MyProfile.getSettingByName<TableColumnOption>({
                    name: `table_setting_${standardName}`,
                    userId,
                    unionMainId
                });

                if (remoteSetting?.values && remoteSetting.values?.columnOptionArr?.length > 0) {
                    console.log(`从远程获取到配置[${standardName}]`, remoteSetting.values);

                    // 检查版本是否兼容
                    if (remoteSetting.values.version && remoteSetting.values.version !== TABLE_CONFIG_VERSION) {
                        console.warn(`远程配置版本(${remoteSetting.values.version})与当前版本(${TABLE_CONFIG_VERSION})不匹配，使用默认配置`);
                        await this.resetTableConfig(standardName, defaultConfig, userId, unionMainId);
                        return defaultConfig.columnOptionArr;
                    }

                    // 使用远程配置，但标记来源
                    const remoteConfig = {
                        ...remoteSetting.values,
                        name: standardName, // 确保使用标准名称
                        source: 'remote' as const,
                        // 确保有版本信息
                        version: remoteSetting.values.version || TABLE_CONFIG_VERSION
                    };

                    // 保存到本地
                    tableColumnOptionArr.push(remoteConfig);
                    set({ tableColumnOptionArr });

                    return remoteConfig.columnOptionArr.sort((a, b) => a.sort - b.sort);
                } else {
                    // 没有远程配置，使用默认配置并保存
                    console.log(`无远程配置，使用默认配置[${standardName}]`);
                    const newDefaultConfig = {
                        ...defaultConfig,
                        name: standardName, // 确保使用标准名称
                        version: TABLE_CONFIG_VERSION,
                        updatedAt: Date.now(),
                        source: 'default' as const
                    };

                    // 保存到本地
                    tableColumnOptionArr.push(newDefaultConfig);
                    set({ tableColumnOptionArr });

                    // 保存到后端
                    await KysionApis.MyProfile.setSettingByName<TableColumnOption>({
                        name: `table_setting_${standardName}`,
                        values: newDefaultConfig,
                        desc: `表格配置-${standardName}`,
                        userId,
                        unionMainId
                    });

                    return newDefaultConfig.columnOptionArr;
                }
            } catch (error) {
                console.error('初始化表格配置失败:', error);
                // 出错时使用默认配置但不保存
                return defaultConfig.columnOptionArr;
            }
        },

        /**
         * 重置表格配置到默认值
         * @param name 表格标识符
         * @param defaultConfig 默认配置
         * @param userId 用户ID (可选参数)
         * @param unionMainId 公司ID (可选参数)
         */
        async resetTableConfig(name: React.Key, defaultConfig: TableColumnOption, userId?: React.Key, unionMainId?: React.Key) {
            try {
                // 规范化表格标识符
                const normalizedName = name.toString().replace(/_column_conf$/, '');
                const standardName = `${normalizedName}_column_conf`;

                // 确保defaultConfig使用标准名称
                defaultConfig.name = standardName;

                const currentUserId = userId || getCurrentUserId();
                const currentCompanyId = unionMainId || getCurrentCompanyId();

                // 执行一次冗余配置清理
                cleanDuplicateConfigs();

                const tableColumnOptionArr = [...get().tableColumnOptionArr];

                // 删除所有与当前表格相关的配置
                const newTableColumnOptionArr = tableColumnOptionArr.filter(item => {
                    const itemNormalizedName = item.name.toString().replace(/_column_conf$/, '');
                    return itemNormalizedName !== normalizedName;
                });

                // 准备默认配置
                const newDefaultConfig = {
                    ...defaultConfig,
                    name: standardName,
                    version: TABLE_CONFIG_VERSION,
                    updatedAt: Date.now(),
                    source: 'default' as const
                };

                // 更新本地存储
                newTableColumnOptionArr.push(newDefaultConfig);
                set({ tableColumnOptionArr: newTableColumnOptionArr });

                // 清除后端存储的配置
                await KysionApis.MyProfile.setSettingByName<TableColumnOption>({
                    name: `table_setting_${standardName}`,
                    values: newDefaultConfig,
                    desc: `表格配置-${standardName}(重置默认)`,
                    userId: currentUserId,
                    unionMainId: currentCompanyId
                });

                console.log(`表格配置已重置[${standardName}]`);
                return Promise.resolve({ data: newDefaultConfig.columnOptionArr, success: true });
            } catch (error) {
                console.error('重置表格配置失败:', error);
                return Promise.reject(error);
            }
        },

        /**
         * 从后端刷新所有表格配置
         * @deprecated 推荐使用initTableConfig初始化单个表格
         */
        async refresh(userId?: React.Key, unionMainId?: React.Key) {
            try {
                const currentUserId = userId || getCurrentUserId();
                const currentCompanyId = unionMainId || getCurrentCompanyId();
                const result = await KysionApis.MyProfile.getSettingByName<IMyTableStateType>({
                    name: 'my_table_setting',
                    userId: currentUserId,
                    unionMainId: currentCompanyId
                });

                if (result?.values?.tableColumnOptionArr) {
                    // 更新时间戳和来源标记
                    const updatedConfigs = result.values.tableColumnOptionArr.map(config => ({
                        ...config,
                        updatedAt: Date.now(),
                        source: 'remote' as const,
                        // 保持原有版本不变
                        version: config.version || TABLE_CONFIG_VERSION
                    }));

                    set({ tableColumnOptionArr: updatedConfigs });
                    console.log('已从后端刷新所有表格配置');
                }
            } catch (error) {
                console.error('刷新表格配置失败:', error);
            }
        },

        /**
         * 保存所有表格配置到后端
         * @deprecated 推荐使用setTableColumnOption单独保存配置
         */
        save() {
            const userId = getCurrentUserId();
            const unionMainId = getCurrentCompanyId();

            return KysionApis.MyProfile.setSettingByName<IMyTableStateType>({
                name: 'my_table_setting',
                values: get(),
                desc: '我的表格设置',
                userId,
                unionMainId
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
                const localConfigIndex = tableColumnOptionArr.findIndex(item => {
                    const itemNormalized = item.name.toString().replace(/_column_conf$/, '');
                    return itemNormalized === normalizedName;
                });

                // 如果本地没有配置，直接返回
                if (localConfigIndex === -1) {
                    return false;
                }

                const localConfig = tableColumnOptionArr[localConfigIndex];

                // 检查版本是否需要升级
                if (!localConfig.version || localConfig.version !== TABLE_CONFIG_VERSION) {
                    console.log(`配置版本不一致，需要升级: ${localConfig.version || '无版本'} -> ${TABLE_CONFIG_VERSION}`);

                    // 重置配置
                    await this.resetTableConfig(standardName, defaultConfig);
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