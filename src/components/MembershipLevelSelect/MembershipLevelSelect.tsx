import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Col, Flex, Select, SelectProps } from 'antd';
import { MemberLevelType, Records, SelectOptionType, Filter, WhereSet, Query } from '@kysion/types';
import { useTranslation } from 'react-i18next';
import { KysionApis } from '../../api';

interface MembershipLevelSelectProps {
    defaultValue?: number;
    onChange?: (value: number, data: MemberLevelType) => void;
    onClear?: () => void;
    labelRender?: (memberLevel: MemberLevelType) => React.ReactNode;
    selectProps?: SelectProps;
    showSymbol?: boolean;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
}

const MembershipLevelSelect: React.FC<MembershipLevelSelectProps> = (props) => {
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
    const [options, setOptions] = useState<SelectOptionType<MemberLevelType>[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const optionsRef = useRef<SelectOptionType<MemberLevelType>[]>([]);

    // 将当前options同步到ref
    useEffect(() => {
        optionsRef.current = options;

        if (defaultValue) {
            fetchInitial();
        }
        // 不管有没有初始值，都需要预加载会员等级列表
        fetchMembershipLevel();
    }, []);

    const fetchMembershipLevel = useCallback(async (searchText?: string) => {
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
                        field: 'name',
                        where: WhereSet.Like,
                        value: `%${searchText}%`
                    })
                ];
            }

            const response = await KysionApis.MemberLevel.queryMemberLevelList();
            const data = response as MemberLevelType[];

            if (data && data) {
                const currentOptions = optionsRef.current;
                let filteredRecords = data;

                // 如果有搜索文本，进行客户端过滤
                if (searchText) {
                    filteredRecords = data.filter(record =>
                        record.name.toLowerCase().includes(searchText.toLowerCase())
                    );
                }

                const newOptions = filteredRecords
                    .filter(v => !currentOptions.some(opt => opt.value === v.id))
                    .map((data: MemberLevelType) => {
                        return {
                            label: <Flex><span>{data.name}</span><span className='text-color-gray text-right ml-16px'>{data.desc}</span></Flex>,
                            value: data.id,
                            data: data,
                        } as SelectOptionType<MemberLevelType>
                    });
                setOptions([...currentOptions, ...newOptions]);
                setDataLoaded(true);
            }
        } catch (error) {
            console.error('Failed to fetch member levels:', error);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    const fetchInitial = useCallback(async () => {
        if (!defaultValue) return;

        setInitialLoading(true);
        try {
            const response = await KysionApis.MemberLevel.getMemberLevelById({ id: defaultValue });

            if (response) {
                const data = response as MemberLevelType;

                const initialOption = {
                    label: data.name,
                    value: data.id,
                    data: data,
                } as SelectOptionType<MemberLevelType>;

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
            console.error('Failed to fetch initial member level:', error);
        } finally {
            setInitialLoading(false);
        }
    }, [defaultValue]);

    const handleSearch = (searchText: string) => {
        fetchMembershipLevel(searchText);
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
            fetchMembershipLevel();
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

export default MembershipLevelSelect;