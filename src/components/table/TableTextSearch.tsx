import type { FilterDropdownProps } from 'antd/lib/table/interface';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Flex, Input } from 'antd';
import classNames from 'classnames';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import React from 'react';

export type TableTextSearchFilterRef = object;

export interface TableTextSearchFilterProps<T> {
  title: string;
  dataIndex: keyof T;
  className?: string;
  onFilter: FilterDropdownProps;
  onPassEnter?: (
    selectedKeys: React.Key[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: keyof T,
  ) => void;
  onReset?: (clearFilters: () => void) => void;
}

export const TableTextSearchFilter = memo<TableTextSearchFilterProps<any>>((props) => {
  const { t } = useTranslation();

  const { setSelectedKeys, selectedKeys, confirm, clearFilters, close } = props.onFilter;
  const { title, dataIndex, onPassEnter, onReset, className } = props;

  return (
    <Flex
      vertical
      align="center"
      className={classNames('flex p-8px min-w-220px relative', className)}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Input
        placeholder={`${t('kysion.common.search')} ${t(title) ?? dataIndex}`}
        value={selectedKeys[0]}
        className="w-full flex"
        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => onPassEnter?.(selectedKeys as string[], confirm, dataIndex)}
        style={{ marginBottom: 8, display: 'block' }}
      />
      <Flex className="relative w-full flex" gap={8}>
        <Button
          type="primary"
          size="small"
          block
          icon={<SearchOutlined />}
          onClick={() => {
            onPassEnter?.(selectedKeys, confirm, dataIndex);
          }}
        >
          {t('kysion.common.search')}
        </Button>
        <Button
          block
          onClick={() => {
            setSelectedKeys([]);
            if (clearFilters) onReset?.(clearFilters);
            confirm({ closeDropdown: false });
            close();
          }}
          size="small"
        >
          {t('kysion.common.reset')}
        </Button>
      </Flex>
    </Flex>
  );
});

TableTextSearchFilter.displayName = 'TextSearch';
