import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Select, SelectProps } from 'antd';
import { KysionApis } from '../../api';
import { CurrencyInfoType, SortSet, Records, SelectOptionType, Filter, WhereSet, Query } from '@kysion/types';
import { useTranslation } from 'react-i18next';

interface CurrencySelectProps {
    value?: string;
    onChange?: (value: string) => void;
    labelRender?: (currency: CurrencyInfoType) => React.ReactNode;
    selectProps?: SelectProps;
    showSymbol?: boolean;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({
    value,
    onChange,
    labelRender,
    selectProps,
    showSymbol = true,
    placeholder,
    disabled = false,
    allowClear = true,
}) => {
    const { t } = useTranslation();
    const [options, setOptions] = useState<SelectOptionType<CurrencyInfoType>[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const optionsRef = useRef<SelectOptionType<CurrencyInfoType>[]>([]);

    // 将当前options同步到ref
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    const fetchCurrencies = useCallback(async (searchText?: string) => {
        if (loading) return;

        setLoading(true);
        try {
            // 构建查询条件
            const query: Query = {
                pageSize: 100,
                pageNum: 1,
                filter: [],
                orderBy: [{ field: 'code', sort: SortSet.Asc }]
            };

            // 如果有搜索文本，添加过滤条件
            if (searchText) {
                query.filter = [
                    new Filter({
                        field: 'code',
                        where: WhereSet.Like,
                        value: `%${searchText}%`
                    }),
                    new Filter({
                        field: 'currencyCn',
                        where: WhereSet.Like,
                        value: `%${searchText}%`,
                        isOrWhere: true
                    }),
                    new Filter({
                        field: 'currencyEn',
                        where: WhereSet.Like,
                        value: `%${searchText}%`,
                        isOrWhere: true
                    })
                ];
            }

            console.log('Fetching currencies...');
            const response = await KysionApis.System.Finance.queryCurrencyList(query);
            const data = response as Records<CurrencyInfoType>;

            if (data && data.records) {
                const currentOptions = optionsRef.current;
                const newOptions = data.records
                    .filter(currency => !currentOptions.some(opt => opt.value === currency.currencyCode))
                    .map((currency: CurrencyInfoType) => {
                        return {
                            label: formatCurrencyLabel(currency),
                            value: currency.currencyCode,
                            data: currency,
                        } as SelectOptionType<CurrencyInfoType>
                    });
                setOptions([...currentOptions, ...newOptions]);
                setDataLoaded(true);
                console.log('Currencies loaded:', [...currentOptions, ...newOptions].length);
            }
        } catch (error) {
            console.error('Failed to fetch currencies:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 获取初始选中货币信息
    const fetchInitialCurrency = useCallback(async () => {
        if (!value) return;

        setInitialLoading(true);
        try {
            const response = await KysionApis.System.Finance.getCurrencyByCode({ currencyCode: value });

            if (response) {
                const currency = response as CurrencyInfoType;

                const initialOption = {
                    label: formatCurrencyLabel(currency),
                    value: currency.currencyCode,
                    data: currency,
                } as SelectOptionType<CurrencyInfoType>;

                setOptions(prevOptions => {
                    // 检查是否已存在相同的选项
                    const exists = prevOptions.some(opt => opt.value === currency.currencyCode);
                    if (!exists) {
                        return [...prevOptions, initialOption];
                    }
                    return prevOptions;
                });
            }
        } catch (error) {
            console.error('Failed to fetch initial currency:', error);
        } finally {
            setInitialLoading(false);
        }
    }, [value, showSymbol]);

    // 格式化货币显示标签
    const formatCurrencyLabel = (currency: CurrencyInfoType) => {
        if (labelRender) {
            return labelRender(currency);
        }

        const symbolPart = showSymbol && currency.symbol ? `(${currency.symbol})` : '';
        const currencyName = navigator.language.startsWith('zh') ? currency.currencyCn : currency.currencyEn;
        return `${currency.currencyCode} - ${currencyName} ${symbolPart}`;
    };

    // 初始加载
    useEffect(() => {
        if (value) {
            // 如果有初始值，先加载当前选中货币的信息
            fetchInitialCurrency();
        }

        // 不管有没有初始值，都需要预加载货币列表
        fetchCurrencies();
    }, []);

    const handleSearch = (searchText: string) => {
        fetchCurrencies(searchText);
    };

    const handleChange = (newValue: string) => {
        onChange?.(newValue);
    };

    // 下拉框打开时确保数据已加载
    const handleDropdownVisibleChange = (open: boolean) => {
        if (open && (!dataLoaded || options.length === 0)) {
            fetchCurrencies();
        }
    };

    return (
        <Select
            {...selectProps}
            value={value}
            options={options}
            loading={loading || initialLoading}
            onSearch={handleSearch}
            onChange={handleChange}
            onDropdownVisibleChange={handleDropdownVisibleChange}
            showSearch
            filterOption={false}
            placeholder={placeholder || t('kysion.common.select.placeholder')}
            disabled={disabled}
            allowClear={allowClear}
        />
    );
};

export default CurrencySelect; 