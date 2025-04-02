import { useState, useEffect } from 'react';
import { KyTableColumnType, TableColumnOption as TypedTableColumnOption } from '../../types/table';
import { useTableActions } from '../../store';
import { makeTableColumnOption, makeTableColumnState } from '../../components/TableSetting';
import { useTranslation } from 'react-i18next';

/**
 * 表格列配置选项类型
 */
export interface TableColumnSettings {
    key: string;
    title: any;
    source?: 'local' | 'remote' | 'default';
    [key: string]: any;
}

/**
 * 通用表格配置钩子参数
 */
export interface UseTableOptions<T = any, K extends string = string> {
    /**
     * 唯一标识符，用于持久化表格配置
     */
    identifier: string;

    /**
     * 默认列配置生成函数
     */
    createColumns: (isDefault?: boolean) => KyTableColumnType<T, K>[] | any[];

    /**
     * 默认页面大小
     */
    defaultPageSize?: number;

    /**
     * 页面大小选项
     */
    pageSizeOptions?: string[];
}

/**
 * 增强的表格状态钩子，支持保存列设置
 * @param identifier 表格标识符
 * @param columnsWithI18n 带国际化的列配置
 * @returns 表格状态
 */
export const useTable = <T, TKeys extends string, TCustomColumn = object>(
    identifier: string,
    columnsWithI18n: (KyTableColumnType<T, TKeys> & TCustomColumn)[]
): {
    tableColumnsState: KyTableColumnType<T, TKeys>[];
    setTableColumnsState: React.Dispatch<React.SetStateAction<KyTableColumnType<T, TKeys>[]>>;
    loading: boolean;
    refreshTable: () => void;
    getDefaultDataSource: () => KyTableColumnType<T, TKeys>[];
} => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [tableColumnsState, setTableColumnsState] = useState<KyTableColumnType<T, TKeys>[]>([]);
    const [refresh, setRefresh] = useState(0);
    const tableActions = useTableActions();

    // 规范化表格标识符
    const normalizedIdentifier = identifier.replace(/_column_conf$/, '');
    const standardIdentifier = `${normalizedIdentifier}_column_conf`;

    // 保存默认表格列配置的副本，用于重置
    const [defaultCustomTableColumnArr] = useState<any[]>(columnsWithI18n);

    // 直接在控制台输出初始列配置，方便调试
    console.log('初始列配置:', columnsWithI18n);

    const refreshTable = () => {
        setLoading(true);
        setTimeout(() => {
            setRefresh(refresh + 1);
            setLoading(false);
        }, 0);
    };

    // 初始化表格列配置
    useEffect(() => {
        const initTable = async () => {
            setLoading(true);
            try {
                console.log(`%c【表格初始化】[${standardIdentifier}] - 开始`, 'color: blue; font-weight: bold;');

                // 清理本地存储的冗余配置
                tableActions.cleanDuplicateConfigs();

                // 创建默认配置对象
                const defaultConfig = {
                    name: standardIdentifier,
                    columnOptionArr: makeTableColumnOption(columnsWithI18n as any, []).map(col => ({
                        ...col.columnOptionState,
                        title: col.title,
                        conf: col.columnOption,
                        sort: col.columnSort || 0,
                        key: col.key || col.dataIndex
                    })),
                    pageSize: 20
                };

                // 步骤1: 直接从本地获取配置
                console.log(`%c【表格初始化】[${standardIdentifier}] - 尝试从本地获取配置`, 'color: blue;');
                const localConfig = tableActions.getTableColumnOption(standardIdentifier);
                console.log(`【表格初始化】[${standardIdentifier}] - 本地配置项数量:`, localConfig?.length || 0);

                // 从本地配置应用的标志
                let appliedFromLocal = false;

                // 如果本地有配置，先尝试应用
                if (localConfig && Array.isArray(localConfig) && localConfig.length > 0) {
                    try {
                        console.log(`%c【表格初始化】[${standardIdentifier}] - 尝试应用本地配置`, 'color: green;');

                        // 确保每个本地配置项的source属性设置为'local'
                        const enhancedLocalConfig = localConfig.map(item => {
                            if (!item) return null;
                            return { ...item, source: 'local' as const };
                        }).filter(Boolean);

                        applyColumnsConfig(enhancedLocalConfig);
                        appliedFromLocal = true;

                        // 异步检查配置是否需要更新
                        setTimeout(() => {
                            tableActions.checkConfigUpgrade(standardIdentifier, defaultConfig)
                                .then(updated => {
                                    if (updated) {
                                        console.log(`%c【表格初始化】[${standardIdentifier}] - 配置已升级，刷新表格`, 'color: orange;');
                                        refreshTable();
                                    }
                                })
                                .catch(err => {
                                    console.error(`【表格初始化】[${standardIdentifier}] - 检查配置升级出错:`, err);
                                });
                        }, 100);
                    } catch (e) {
                        console.error(`【表格初始化】[${standardIdentifier}] - 应用本地配置失败:`, e);
                        appliedFromLocal = false;
                    }
                }

                // 如果没有成功应用本地配置，尝试从后端获取
                if (!appliedFromLocal) {
                    console.log(`%c【表格初始化】[${standardIdentifier}] - 尝试从后端获取配置`, 'color: blue;');
                    // 步骤2: 尝试从后端获取配置
                    try {
                        const remoteConfig = await tableActions.getRemoteConfig(standardIdentifier);

                        if (remoteConfig && remoteConfig.columnOptionArr && Array.isArray(remoteConfig.columnOptionArr) && remoteConfig.columnOptionArr.length > 0) {
                            console.log(`%c【表格初始化】[${standardIdentifier}] - 从后端获取到配置，尝试应用`, 'color: green;', remoteConfig);
                            try {
                                // 确保每个远程配置项的source属性设置为'remote'
                                const enhancedRemoteConfig = remoteConfig.columnOptionArr.map(item => {
                                    if (!item) return null;
                                    return { ...item, source: 'remote' as const };
                                }).filter(Boolean);

                                applyColumnsConfig(enhancedRemoteConfig);
                                console.log(`%c【表格初始化】[${standardIdentifier}] - 成功应用后端配置`, 'color: green;');

                                // 同时保存到本地
                                try {
                                    await tableActions.setTableColumnOption({
                                        name: standardIdentifier,
                                        columnOptionArr: enhancedRemoteConfig
                                    }, false);
                                    console.log(`%c【表格初始化】[${standardIdentifier}] - 后端配置已同步到本地`, 'color: green;');
                                } catch (saveErr) {
                                    console.warn(`%c【表格初始化】[${standardIdentifier}] - 保存后端配置到本地失败:`, 'color: orange;', saveErr);
                                }

                                return;
                            } catch (e) {
                                console.error(`【表格初始化】[${standardIdentifier}] - 应用后端配置失败:`, e);
                            }
                        } else {
                            console.log(`%c【表格初始化】[${standardIdentifier}] - 后端没有返回有效配置`, 'color: orange;');
                        }
                    } catch (e) {
                        console.error(`【表格初始化】[${standardIdentifier}] - 从后端获取配置失败:`, e);
                    }

                    // 步骤3: 如果后端也没有配置，使用并保存默认配置
                    console.log(`%c【表格初始化】[${standardIdentifier}] - 创建并保存默认配置`, 'color: blue;');
                    try {
                        // 确保每个默认配置项的source属性设置为'default'
                        const enhancedDefaultConfig = {
                            ...defaultConfig,
                            columnOptionArr: defaultConfig.columnOptionArr.map(item => {
                                if (!item) return null;
                                return { ...item, source: 'default' as const };
                            }).filter(Boolean)
                        };

                        const result = await tableActions.setTableColumnOption(enhancedDefaultConfig, true);
                        if (result.success) {
                            console.log(`%c【表格初始化】[${standardIdentifier}] - 默认配置已保存`, 'color: green;');
                        } else {
                            console.warn(`%c【表格初始化】[${standardIdentifier}] - 保存默认配置失败:`, 'color: orange;', result.error);
                        }
                    } catch (e) {
                        console.error(`【表格初始化】[${standardIdentifier}] - 保存默认配置出错:`, e);
                    }

                    // 应用默认配置
                    console.log(`%c【表格初始化】[${standardIdentifier}] - 应用默认配置`, 'color: blue;');
                    applyDefaultConfig();
                }

                console.log(`%c【表格初始化】[${standardIdentifier}] - 完成`, 'color: blue; font-weight: bold;');
            } catch (error) {
                console.error(`%c【表格初始化】[${standardIdentifier}] - 发生错误:`, 'color: red;', error);
                // 出错时使用默认配置
                applyDefaultConfig();
            } finally {
                setLoading(false);
            }
        };

        // 应用列配置的公共函数
        const applyColumnsConfig = (columnOptions: any[]) => {
            if (!columnOptions || !Array.isArray(columnOptions) || columnOptions.length === 0) {
                console.warn(`%c【表格初始化】[${standardIdentifier}] - 配置为空或无效`, 'color: orange;');
                applyDefaultConfig();
                return;
            }

            try {
                console.log(`%c【表格初始化】[${standardIdentifier}] - 应用配置开始，共${columnOptions.length}项`, 'color: green;');

                // 记录配置项的详细信息，帮助调试
                columnOptions.forEach((item, index) => {
                    if (!item) {
                        console.warn(`【表格初始化】配置项[${index}]为空`);
                        return;
                    }

                    // 打印每个配置项的关键属性
                    const keyInfo = {
                        key: item.key,
                        title: item.title,
                        sort: item.sort,
                        fixed: item.fixed,
                        hidden: item.hidden
                    };
                    console.log(`【表格初始化】配置项[${index}]信息:`, keyInfo);
                });

                // 创建最终的列配置，整合默认配置和用户配置
                console.log(`【表格初始化】开始生成最终列配置，默认列数量:`, columnsWithI18n.length);

                // 在应用前确保每个配置项都有sort属性
                const normalizedOptions = columnOptions.map((item, index) => {
                    if (!item) return null;

                    // 确保有sort属性
                    if (typeof item.sort !== 'number') {
                        console.log(`【表格初始化】配置项缺少sort属性，设置为索引${index}`);
                        return { ...item, sort: index };
                    }

                    return item;
                }).filter(Boolean);

                // 将normalizedOptions按sort排序
                normalizedOptions.sort((a, b) => {
                    const aSort = typeof a?.sort === 'number' ? a.sort : 0;
                    const bSort = typeof b?.sort === 'number' ? b.sort : 0;
                    return aSort - bSort;
                });

                // 在整合配置前确保columnOptions有效
                console.log(`【表格初始化】规范化后的配置项数量:`, normalizedOptions.length);

                try {
                    // 应用列配置
                    const finalColumns = makeTableColumnState(makeTableColumnOption(columnsWithI18n as KyTableColumnType<T, string>[], normalizedOptions));

                    if (!finalColumns || !Array.isArray(finalColumns) || finalColumns.length === 0) {
                        console.warn(`%c【表格初始化】[${standardIdentifier}] - 生成的最终列配置为空或无效`, 'color: orange;');
                        applyDefaultConfig();
                        return;
                    }

                    console.log(`%c【表格初始化】[${standardIdentifier}] - 最终列配置项数量:`, 'color: green;', finalColumns.length);

                    // 处理侧边固定列问题
                    for (const col of finalColumns) {
                        // 检查并处理固定列属性
                        try {
                            // 检查columnOptionState中的fixed设置
                            if (col.columnOptionState?.fixed) {
                                const fixedValue = String(col.columnOptionState.fixed);

                                if (fixedValue === 'left') {
                                    col.fixed = 'left';
                                    console.log(`【表格初始化】强制设置列 ${col.key || col.dataIndex} 左固定`);
                                } else if (fixedValue === 'right') {
                                    col.fixed = 'right';
                                    console.log(`【表格初始化】强制设置列 ${col.key || col.dataIndex} 右固定`);
                                }

                                // 固定列必须有宽度
                                if (col.fixed && !col.width) {
                                    col.width = 150;
                                }
                            }
                        } catch (e) {
                            console.error(`【表格初始化】处理固定列属性出错:`, e);
                        }
                    }

                    // 应用配置
                    setTableColumnsState(finalColumns as unknown as KyTableColumnType<T, TKeys>[]);
                    console.log(`%c【表格初始化】[${standardIdentifier}] - 配置已成功应用到表格`, 'color: green; font-weight: bold;');
                } catch (e) {
                    console.error(`%c【表格初始化】[${standardIdentifier}] - 应用列配置过程出错:`, 'color: red;', e);
                    applyDefaultConfig();
                }
            } catch (e) {
                console.error(`%c【表格初始化】[${standardIdentifier}] - 应用配置出错:`, 'color: red;', e);
                applyDefaultConfig();
            }
        };

        // 应用默认配置的公共函数
        const applyDefaultConfig = () => {
            console.log(`%c【表格初始化】[${standardIdentifier}] - 应用默认配置开始`, 'color: orange; font-weight: bold;');

            try {
                // 应用默认列配置
                const result = [...columnsWithI18n];
                console.log(`【表格初始化】[${standardIdentifier}] - 默认列数量:`, result.length);

                // 处理默认情况下的侧边固定列问题
                for (const col of result) {
                    if (col.fixed) {
                        // 确保有宽度
                        if (!col.width) {
                            col.width = 150;
                        }
                        console.log(`【表格初始化】[${standardIdentifier}] - 默认固定列:`, { column: col.key || col.dataIndex, fixed: col.fixed });
                    }
                }

                setTableColumnsState(result as any);
                console.log(`%c【表格初始化】[${standardIdentifier}] - 默认配置已成功应用`, 'color: orange; font-weight: bold;');
            } catch (e) {
                console.error(`%c【表格初始化】[${standardIdentifier}] - 应用默认配置失败:`, 'color: red;', e);
                // 最后的回退方案，直接设置原始列配置
                setTableColumnsState(columnsWithI18n as any);
            }
        };

        initTable();
    }, [standardIdentifier, refresh]);

    return {
        tableColumnsState,
        setTableColumnsState,
        loading,
        refreshTable,

        // 获取默认的列配置，用于重置
        getDefaultDataSource: () => {
            const defaultColumns = makeTableColumnState(makeTableColumnOption(defaultCustomTableColumnArr as any, []));
            return defaultColumns as unknown as KyTableColumnType<T, TKeys>[];
        },
    };
};

export default useTable; 