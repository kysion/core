import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Flex, Select, SelectProps } from 'antd';
import { GoodsInfoType, Records, SelectOptionType, Filter, WhereSet, Query } from '@kysion/types';
import { useTranslation } from 'react-i18next';
import { KysionApis } from '../../api';

interface GoodsSelectProps {
    defaultValue?: number;
    onChange?: (value: number, data: GoodsInfoType) => void;
    onClear?: () => void;
    labelRender?: (goods: GoodsInfoType) => React.ReactNode;
    selectProps?: SelectProps;
    showSymbol?: boolean;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
}

const GoodsSelect: React.FC<GoodsSelectProps> = (props) => {
    const {
        defaultValue,
        onChange,
        onClear,
        labelRender,
        selectProps,
        showSymbol = true,
        placeholder = 'Please select',
        disabled = false,
        allowClear = true,
    } = props;
    const { t } = useTranslation();
    const [options, setOptions] = useState<SelectOptionType<GoodsInfoType>[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const optionsRef = useRef<SelectOptionType<GoodsInfoType>[]>([]);

    // 将当前options同步到ref
    useEffect(() => {
        optionsRef.current = options;

        if (defaultValue) {
            fetchInitial();
        }
        // 不管有没有初始值，都需要预加载商品列表
        fetchGoods();
    }, []);

    const fetchGoods = useCallback(async (searchText?: string) => {
        if (loading) return;

        setLoading(true);
        try {
            // 构建查询条件
            const query: Query = {
                pageSize: 100,
                pageNum: 1,
                filter: [],
                orderBy: []
            };

            // 如果有搜索文本，添加过滤条件
            if (searchText) {
                query.filter = [
                    new Filter({
                        field: 'title',
                        where: WhereSet.Like,
                        value: `%${searchText}%`
                    })
                ];
            }

            const response = await KysionApis.Goods.Management.queryGoodsList(query);
            const records = response as Records<GoodsInfoType>;

            if (records && records.records) {
                const currentOptions = optionsRef.current;
                let filteredRecords = records.records;

                // 如果有搜索文本，进行客户端过滤
                if (searchText) {
                    filteredRecords = records.records.filter(record =>
                        record.title.toLowerCase().includes(searchText.toLowerCase())
                    );
                }

                const newOptions = filteredRecords
                    .filter(v => !currentOptions.some(opt => opt.value === v.id))
                    .map((data: GoodsInfoType) => {
                        return {
                            label: <Flex><span>{data.title}</span><span className='text-color-gray text-right ml-16px'>{data.summary}</span></Flex>,
                            value: data.id,
                            data: data,
                        } as SelectOptionType<GoodsInfoType>
                    });
                setOptions([...currentOptions, ...newOptions]);
                setDataLoaded(true);
            }
        } catch (error) {
            console.error('Failed to fetch goods:', error);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    const fetchInitial = useCallback(async () => {
        if (!defaultValue) return;

        setInitialLoading(true);
        try {
            const response = await KysionApis.Goods.Management.getGoodsById({ id: defaultValue });

            if (response) {
                const data = response as GoodsInfoType;

                const initialOption = {
                    label: data.title,
                    value: data.id,
                    data: data,
                } as SelectOptionType<GoodsInfoType>;

                setOptions(prevOptions => {
                    // 检查是否已存在相同的选项
                    const exists = prevOptions.some(opt => opt.value === data.id);
                    if (!exists) {
                        return [...prevOptions, initialOption];
                    }
                    return prevOptions;
                });
            }
        } catch (error) {
            console.error('Failed to fetch initial goods:', error);
        } finally {
            setInitialLoading(false);
        }
    }, [defaultValue]);

    const handleSearch = (searchText: string) => {
        fetchGoods(searchText);
    };

    const handleChange = (newValue: number) => {
        options.filter(option => option.value === newValue).forEach(option => {
            if (option.data) {
                onChange?.(newValue, option.data);
            }
        });
    };

    const handleClear = () => {
        onClear?.();
    };

    // 下拉框打开时确保数据已加载
    const handleDropdownVisibleChange = (open: boolean) => {
        if (open && (!dataLoaded || options.length === 0)) {
            fetchGoods();
        }
    };

    return (
        <Select
            value={defaultValue}
            options={options}
            loading={loading || initialLoading}
            onSearch={selectProps?.showSearch !== false ? handleSearch : undefined}
            onChange={handleChange}
            onOpenChange={handleDropdownVisibleChange}
            onClear={handleClear}
            showSearch
            filterOption={false}
            placeholder={placeholder || t('kysion.common.select.placeholder')}
            disabled={disabled}
            allowClear={allowClear}
            {...selectProps}
        />
    );
};

export default GoodsSelect;