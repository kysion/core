import { useState, useEffect } from 'react';
import { Input, Modal, Spin, Empty, Flex } from 'antd';
import { Icon } from '@iconify/react';
import { KysionApis, APIv2SearchResponse } from '../../api';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash-es';
import React from 'react';
import { KyIcon } from '.';

interface IconSelectProps {
    value?: string;
    onChange?: (value: string) => void;
}

export const IconSelect: React.FC<IconSelectProps> = ({ value, onChange }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [icons, setIcons] = useState<string[]>([]);

    // 搜索图标
    const searchIcons = async (keyword: string) => {
        if (!keyword) {
            setIcons([]);
            return;
        }
        setLoading(true);
        try {
            const response = await KysionApis.Iconify.searchIcons(keyword);
            const data = response as APIv2SearchResponse;
            if (data) {
                setIcons(data.icons);
            }
        } catch (error) {
            console.error('搜索图标失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 防抖处理搜索
    const debouncedSearch = debounce(searchIcons, 300);

    // 处理搜索输入
    const handleSearch = (value: string) => {
        setSearchValue(value);
        debouncedSearch(value);
    };

    // 选择图标
    const handleSelectIcon = (icon: string) => {
        onChange?.(icon);
        setIsModalOpen(false);
    };

    return (
        <>
            <Input
                value={value}
                placeholder={t('system.menu.icon.placeholder')}
                onClick={() => setIsModalOpen(true)}
                readOnly
                addonAfter={value && <KyIcon icon={value} width="16" height="16" />}
            />
            <Modal
                title={t('system.menu.icon.select')}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
            >
                <Input.Search
                    placeholder={t('system.menu.icon.search')}
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <div style={{ height: 400, overflowY: 'auto' }}>
                    <Spin spinning={loading}>
                        {icons.length > 0 ? (
                            <Flex wrap="wrap" gap="small">
                                {icons.map((icon) => (
                                    <div
                                        key={icon}
                                        onClick={() => handleSelectIcon(icon)}
                                        style={{
                                            padding: 16,
                                            border: '1px solid #f0f0f0',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 8,
                                            width: 100,
                                            transition: 'all 0.3s',
                                        }}
                                        className="hover:border-primary hover:bg-primary-1"
                                    >
                                        <Icon icon={icon} width="24" height="24" />
                                        <div style={{
                                            fontSize: 12,
                                            color: '#666',
                                            wordBreak: 'break-all',
                                            textAlign: 'center',
                                            width: '100%'
                                        }}>
                                            {icon}
                                        </div>
                                    </div>
                                ))}
                            </Flex>
                        ) : (
                            <Empty description={t('system.menu.icon.empty')} />
                        )}
                    </Spin>
                </div>
            </Modal >
        </>
    );
};
