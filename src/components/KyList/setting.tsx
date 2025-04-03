import type { ReactNode } from 'react';
import React, {
  createRef,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import type { MenuProps, TableColumnType, TablePaginationConfig } from 'antd';
import {
  Button,
  Checkbox,
  Drawer,
  Dropdown,
  Flex,
  message,
  Spin,
  Switch,
  Table,
  Tooltip,
  Typography,
  Empty,
} from 'antd';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { Icon } from '@iconify/react';
import { debounce } from 'lodash';
import type { ColumnsType } from 'antd/lib/table';
import { Filter, LikeWhereSet, Order, Query } from '@kysion/types';
import {
  KyTableColumnType,
  FixedStateArr,
  FixedStateMap
} from '../../types/table';
import {
  LikeWhereMap,
  SortMap,
  SortSet,
  WhereMap,
  WhereSet,
} from '@kysion/types';

import { useTableActions, useMyProfileState } from '../../store';
import {
  ColumnTitle,
  FilterDropdownProps,
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { CopyConfig } from 'antd/es/typography/Base';
import { SearchOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { KyTranslate } from '../KyTranslate';

export type SearchOption<T> = {
  searchText: string;
  searchColumn?: keyof T;
};

type BaseNamePath = string | number | boolean | (string | number | boolean)[];
export type SpecialString<T> = T | (string & {});

export type DeepNamePath<Store = any, ParentNamePath extends any[] = []> = ParentNamePath['length'] extends 3 ? never : true extends (Store extends BaseNamePath ? true : false) ? ParentNamePath['length'] extends 0 ? Store | BaseNamePath : Store extends any[] ? [...ParentNamePath, number] : never : Store extends any[] ? // Connect path. e.g. { a: { b: string }[] }
  [
    ...ParentNamePath,
    number
  ] | DeepNamePath<Store[number], [...ParentNamePath, number]> : keyof Store extends never ? Store : {
    [FieldKey in keyof Store]: Store[FieldKey] extends Function ? never : (ParentNamePath['length'] extends 0 ? FieldKey : never) | [...ParentNamePath, FieldKey] | DeepNamePath<Required<Store>[FieldKey], [...ParentNamePath, FieldKey]>;
  }[keyof Store];
export { };


export type DataIndex<T = any> = DeepNamePath<T> | SpecialString<T> | number | (SpecialString<T> | number)[];

export interface ColumnsTypeProps<T> {
  dataIndex: DataIndex<keyof T>;
  searchOption?: () => SearchOption<T>;
  title?: ColumnTitle<T>;
  render?: (v: any, row: T) => ReactNode;
  onFilter?: (value: React.Key | boolean, record: T) => boolean;
  onMaskValueText?: (text: string) => string;
  copyable?: boolean | CopyConfig;
  filterDropDown?:
  | React.ReactNode
  | ((props: FilterDropdownProps & { title?: string; dataIndex: keyof T }) => React.ReactNode);
}

export function useColumnSearchProps<T>({
  dataIndex,
  searchOption,
  title,
  render,
  onFilter,
  onMaskValueText,
  copyable,
  filterDropDown,
}: ColumnsTypeProps<T>): TableColumnType<T> {
  const filterDropdownDom =
    filterDropDown && typeof filterDropDown === 'function'
      ? (props: any) => filterDropDown({ ...props, title, dataIndex })
      : filterDropDown;

  return {
    title,
    dataIndex: dataIndex as string,
    onFilter,
    filterDropdown: filterDropDown ? filterDropdownDom : undefined,
    filterIcon: (filtered: boolean) => (
      <SearchOutlined
        size={24}
        className={classNames('font-size-16px', filtered ? 'c-primary' : '')}
      />
    ),
    render: (val, row) => {
      const contentText = val?.toString() ?? '';

      const copyableObj =
        copyable && copyable instanceof Boolean
          ? { text: contentText }
          : { ...(copyable as CopyConfig), text: contentText };

      const newCopyable = contentText.length === 0 ? undefined : copyableObj;

      const searchOptionConf = searchOption?.();

      const searchTextArr = searchOptionConf
        ? [searchOptionConf.searchText].map((item) => {
          return onMaskValueText ? onMaskValueText(item) : item;
        })
        : [];

      return searchOptionConf && searchOptionConf.searchColumn === dataIndex ? (
        <Flex align="center">
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={searchTextArr}
            className="c-base-text"
            autoEscape
            textToHighlight={
              contentText.length > 0
                ? (onMaskValueText
                  ? onMaskValueText(contentText.toString())
                  : contentText
                ).toString()
                : contentText
            }
          />
          {copyable && newCopyable && (
            <Typography.Text
              className="m-l-2px c-blue"
              copyable={contentText.toString().length > 0 ? newCopyable : undefined}
            />
          )}
        </Flex>
      ) : (
        <Flex align="center" className="c-base-text">
          {render ? render(val, row) : val}
          {copyable && newCopyable && (
            <Typography.Text
              className="m-l-2px c-red"
              copyable={contentText.toString().length > 0 ? newCopyable : undefined}
            />
          )}
        </Flex>
      );
    },
  };
}

export const TableOnChangeFunc = <T, TKeys extends string>({
  pagination,
  filters,
  sorter,
  dataColumnStateArr,
  queryParams,
}: {
  pagination: TablePaginationConfig;
  filters: Record<string, FilterValue | null>;
  sorter: SorterResult<T> | SorterResult<T>[];
  extra: TableCurrentDataSource<T>;
  dataColumnStateArr: KyTableColumnType<T, TKeys>[];
  queryParams?: Query;
}) => {
  const makeFilter = (field: string) => {
    const opt = dataColumnStateArr?.find((item) => item.dataIndex === field);

    const valueArr = filters[field] ?? [];

    const result = valueArr.map((fieldValue, _posIndex) => {
      const fieldOption: Filter = {
        field,
        where: WhereSet.Equal,
        value: fieldValue,
        isOrWhere: valueArr.length > 1,
      };
      const queryState = opt?.columnOptionState;

      if (queryState) {
        fieldOption.where = queryState.where!;

        if (queryState.where === WhereSet.Like) {
          fieldOption.value = `%${fieldValue}%`;

          if (queryState.likeWhere === LikeWhereSet.Contains) fieldOption.value = `%${fieldValue}%`;
          else if (queryState.likeWhere === LikeWhereSet.Prefix)
            fieldOption.value = `${fieldValue}%`;
          else if (queryState.likeWhere === LikeWhereSet.Suffix)
            fieldOption.value = `%${fieldValue}`;
        } else if (queryState.where === WhereSet.In) {
          fieldOption.value = filters[field]?.map((item) => item);
        }
      }
      return opt?.fieldOption ? (opt?.fieldOption(fieldOption) ?? fieldOption) : fieldOption;
    });

    return result;
  };

  const filterArr = Object.keys(filters)
    .filter((field) => filters[field])
    .map((field) => makeFilter(field))
    .flat();

  const sortColumnArr = dataColumnStateArr?.filter((item) => item.sorter) ?? [];
  const sortKeys = sortColumnArr.map((item) => item.dataIndex);
  const sortArr: Order[] = [];
  if (sorter && !Array.isArray(sorter)) {
    if (sortKeys.includes(sorter.field?.toString())) {
      sortArr.push(
        new Order({
          field: sorter.field?.toString(),
          sort: sorter.order === 'ascend' ? 'asc' : 'desc',
        }),
      );
    }
  } else if (sorter && Array.isArray(sorter)) {
    for (const item of sorter) {
      if (sortKeys.includes(item.field?.toString())) {
        sortArr.push(
          new Order({
            field: item.field?.toString(),
            sort: item.order === 'ascend' ? 'asc' : 'desc',
          }),
        );
      }
    }
  }

  const query = new Query({
    ...(queryParams ?? { pageNum: 1, pageSize: 20 }),
    filter: filterArr,
    orderBy: sortArr,
    pageNum: pagination.current,
    pageSize: pagination.pageSize,
  });

  return query;
};

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}
const RowContext = React.createContext<RowContextProps>({});
const DragHandle: React.FC = () => {
  const { setActivatorNodeRef, listeners } = useContext(RowContext);
  return (
    <Button
      type="text"
      size="small"
      icon={
        <>
          <Icon icon="tabler:drag-drop" />
        </>
      }
      style={{ cursor: 'grab', touchAction: 'none' }}
      ref={setActivatorNodeRef}
      {...listeners}
    />
  );
};

type RowRef = object;
interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

const Row = forwardRef<RowRef, RowProps>((props, ref) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999, cursor: 'grabbing' } : {}),
    cursor: 'default',
  };

  const contextValue = useMemo<RowContextProps>(
    () => ({ setActivatorNodeRef, listeners }),
    [setActivatorNodeRef, listeners],
  );

  useImperativeHandle(ref, () => ({}));

  return (
    <RowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </RowContext.Provider>
  );
});

Row.displayName = 'Row';

export interface SettingTableRef {
  save: () => void;
  actions?: () => React.ReactNode;
}

export type TableColumn = KyTableColumnType<any, any>['columnOptionState'] & {
  title: string;
  conf: KyTableColumnType<any, any>['columnOption'];
};

export interface SettingTableProps<T, K extends string> {
  identifier: string;
  title?: string;
  actions?: React.ReactNode;
  getDefaultDataSource: (isDefalut: boolean) => TableColumn[];
  onChange?: (data: TableColumn[]) => void;
  onSaved?: (data: KyTableColumnType<T, K>[]) => void;
  onInited?: () => void;
  customHeader?: (() => React.ReactNode) | React.ReactNode | true;
}

export function makeTableColumnState<T = any>(data: KyTableColumnType<T, string>[]): KyTableColumnType<T, any>[] {
  try {
    // 检查data是否有效数组
    if (!data || !Array.isArray(data)) {
      return [];
    }

    // 过滤无效项
    const validData = data.filter(item => !!item);
    if (validData.length === 0) {
      return [];
    }

    const newDataSource = validData.map((item, index) => {
      try {
        const newItem = { ...item };

        // 确保有columnOptionState
        if (!newItem.columnOptionState) {
          newItem.columnOptionState = {
            where: WhereSet.Equal, // 添加必需的where属性
          };
        }

        // 确保有key
        const key = newItem.key || newItem.dataIndex;
        if (!key) {
          newItem.key = `column_${index}`;
        }

        return newItem;
      } catch (e) {
        return item; // 出错时返回原始项
      }
    });

    // 尝试按columnSort排序
    if (newDataSource.some(item => typeof item.columnSort === 'number')) {
      newDataSource.sort((a, b) => {
        // 安全地访问columnSort，确保有默认值
        const aSort = typeof a?.columnSort === 'number' ? a.columnSort : 0;
        const bSort = typeof b?.columnSort === 'number' ? b.columnSort : 0;
        return aSort - bSort;
      });
    }

    return newDataSource;
  } catch (e) {
    // 出错时返回原始数据
    return data;
  }
}

export function makeTableColumnOption<T, K extends string>(
  data: KyTableColumnType<T, K>[],
  state: TableColumn[] = [],
): KyTableColumnType<T, K>[] {
  try {
    // 确保data是数组
    if (!data || !Array.isArray(data)) {
      return [];
    }

    // 确保state是数组
    if (!state || !Array.isArray(state)) {
      state = [];
    }

    // 筛选有效的列配置，排除操作列
    const validData = data.filter((item) => {
      if (!item) {
        return false;
      }

      // 排除操作列
      const isOperationCol =
        item.key === 'operation' ||
        item.dataIndex === 'operation' ||
        (typeof item.title === 'string' &&
          (item.title === '操作' ||
            item.title.toLowerCase() === 'operation'));

      if (isOperationCol) {
        return false;
      }

      return item.columnOption;
    });

    if (validData.length === 0) {
      return [];
    }

    const newDataSource = validData.map((item) => {
      try {
        const newItem = { ...item };

        // 查找该列的用户配置
        const info = state.find((v: any) => {
          // 确保key值有效
          const vKey = v?.key || v?.dataIndex;
          const itemKey = item?.key || item?.dataIndex;

          if (!vKey || !itemKey) {
            return false;
          }

          return vKey === itemKey;
        });

        // 如果找到用户配置，应用它
        if (info) {
          // 安全地合并状态
          newItem.columnOptionState = {
            ...(newItem.columnOptionState || {}),
            ...(info || {}),
          } as any;

          // 确保配置引用一致
          if (info.conf !== item.columnOption) {
            info.conf = item.columnOption;
          }

          // 设置排序
          if (typeof info.sort === 'number') {
            newItem.columnSort = info.sort;
          } else {
            newItem.columnSort = 0;
          }

          // 设置隐藏状态
          newItem.hidden = info.hidden || info.disabled;

          // 处理列固定
          try {
            // 使用字符串值比较，避免类型错误
            const fixedValue = String(info.fixed);

            if (fixedValue === 'left') {
              newItem.fixed = 'left';
              // 确保固定列有宽度
              if (!newItem.width) {
                newItem.width = 150;
              }
            } else if (fixedValue === 'right') {
              newItem.fixed = 'right';
              // 确保固定列有宽度
              if (!newItem.width) {
                newItem.width = 150;
              }
            } else {
              // 明确移除fixed属性
              newItem.fixed = undefined;
            }

            // 直接设置columnOptionState中的fixed
            if (newItem.columnOptionState) {
              newItem.columnOptionState.fixed = info.fixed;
            }
          } catch (e) {
            // 出错时移除固定属性
            newItem.fixed = undefined;
          }

          // 处理排序
          try {
            const hasSortAbility = newItem.columnOptionState?.sortBy !== SortSet.None &&
              newItem.columnOptionState?.sortBy !== undefined;

            if (hasSortAbility) {
              newItem.sorter = true;

              if (newItem.columnOptionState?.sortBy === SortSet.Asc) {
                newItem.sortOrder = 'ascend';
              } else if (newItem.columnOptionState?.sortBy === SortSet.Desc) {
                newItem.sortOrder = 'descend';
              } else {
                newItem.sortOrder = undefined;
              }

              if (newItem.columnOptionState?.sorter === true) {
                newItem.sorter = {
                  multiple: 1,
                };
              }
            } else {
              newItem.sorter = false;
              newItem.sortOrder = undefined;
            }
          } catch (e) {
            newItem.sorter = false;
            newItem.sortOrder = undefined;
          }
        } else {
          // 没有找到用户配置，使用默认配置
          newItem.sorter = newItem.sorter ?? false;
        }

        return newItem;
      } catch (e) {
        return item; // 出错时返回原始项
      }
    });

    // 确保所有项都有columnSort
    const validDataSource = newDataSource.filter(item => item && item.columnSort !== undefined);

    if (validDataSource.length === 0) {
      // 添加默认排序
      newDataSource.forEach((item, index) => {
        if (item) item.columnSort = index;
      });
    }

    // 尝试排序
    try {
      newDataSource.sort((a, b) => {
        // 安全地访问columnSort，确保有默认值
        const aSort = typeof a?.columnSort === 'number' ? a.columnSort : 0;
        const bSort = typeof b?.columnSort === 'number' ? b.columnSort : 0;
        return aSort - bSort;
      });
    } catch (e) {
      console.error('makeTableColumnOption: 排序失败:', e);
    }

    // 添加操作列 (这里我们不再添加操作列，而是让KyTable组件自行处理)
    const operation = data.find((item) => item && item.key === 'operation');
    if (operation) {
      newDataSource.push({ ...operation });
    }

    return newDataSource;
  } catch (e) {
    console.error('makeTableColumnOption函数出错:', e);
    // 出错时返回原始数据
    return data;
  }
}

let canPreview = true;

export const SettingTable = forwardRef<SettingTableRef, SettingTableProps<any, any>>(
  (props, ref) => {
    const { t } = useTranslation();
    const { isAdmin, isSuperAdmin } = useMyProfileState();
    const tableActions = useTableActions();

    const [enablePreview, setEnablePreview] = useState(true);
    const [mySettingStateArr, setMySettingStateArr] = useState<TableColumn[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 规范化表格标识符
    const normalizedIdentifier = props.identifier.replace(/_column_conf$/, '');
    const standardIdentifier = `${normalizedIdentifier}_column_conf`;

    const updateDataSource = debounce((data?: TableColumn[]) => {
      if (!canPreview) return;

      if (props.onChange) {
        props.onChange(data ?? mySettingStateArr);
      }
    }, 350);

    function updateSettingStateArr(data: TableColumn[], delay?: number) {
      setMySettingStateArr([...data]);

      tableActions.setTableColumnOption(
        {
          name: props.identifier,
          columnOptionArr: data,
        }
      );

      if (!delay) updateDataSource(data);
      setTimeout(() => updateDataSource(data), delay);
    }

    function makeActions() {
      return (
        <Flex gap={8}>
          <Button
            type="primary"
            icon={<Icon icon={'mdi:cog-refresh-outline'} />}
            disabled={!props.getDefaultDataSource}
            onClick={() => {
              // 先获取默认设置
              const defaultSetting = props.getDefaultDataSource(true);

              // 显示加载状态
              setIsLoading(true);

              // 创建默认配置
              const defaultConfig = {
                name: standardIdentifier,
                columnOptionArr: defaultSetting,
                pageSize: 20 // 默认页面大小
              };

              // 重置表格配置
              tableActions.setTableColumnOption(defaultConfig, (saveState) => {
                if (saveState) {
                  message.open({
                    type: 'success',
                    content: t('kysion.table.column.resetSuccess')
                  })
                } else {
                  message.open({
                    type: 'error',
                    content: t('kysion.table.column.resetFailed')
                  })
                }
              })

              setMySettingStateArr(defaultSetting);
              setIsLoading(false);
            }}
          >
            {t('kysion.common.restoreDefault')}
          </Button>
        </Flex>
      );
    }

    useImperativeHandle(ref, () => ({
      actions: makeActions,
      save: () => {
        updateSettingStateArr(mySettingStateArr);
      }
    }));

    const onDragEnd = ({ active, over }: DragEndEvent) => {
      console.log('Drag event:', { active, over });

      if (active.id !== over?.id) {
        const activeIndex = mySettingStateArr.findIndex((record) => {
          const recordKey = (record as any).key || record.title;
          return recordKey === active.id;
        });
        const overIndex = mySettingStateArr.findIndex((record) => {
          const recordKey = (record as any).key || record.title;
          return recordKey === over?.id;
        });

        if (activeIndex === -1 || overIndex === -1) {
          return;
        }

        updateSettingStateArr(
          arrayMove(mySettingStateArr, activeIndex, overIndex).map((item, index) => {
            item.sort = index;
            return item;
          }),
          100,
        );
      }
    };

    useEffect(() => {
      const loadTableConfig = async () => {
        setIsLoading(true);
        try {
          // 先尝试清理冗余配置
          tableActions.cleanDuplicateConfigs();

          // 先获取默认设置
          const defaultSetting = props.getDefaultDataSource!(true);

          // 创建默认配置
          const defaultConfig = {
            name: standardIdentifier,
            columnOptionArr: defaultSetting,
          };

          // 从本地获取配置
          const dataSource = tableActions.getTableConfig(standardIdentifier, defaultConfig);

          // 过滤掉操作列，操作列不应该出现在配置中
          const filteredDataSourceArr = dataSource.columnOptionArr.filter(item => {
            if (!item) return false;

            // 使用类型断言安全访问属性
            const itemKey = (item as any).key;
            const itemDataIndex = (item as any).dataIndex;
            const itemTitle = item.title;

            // 判断是否为操作列
            const isOperationCol =
              itemKey === 'operation' ||
              itemDataIndex === 'operation' ||
              (typeof itemTitle === 'string' &&
                (itemTitle.includes('操作') ||
                  itemTitle.toLowerCase().includes('operation')));

            return !isOperationCol;
          });

          setMySettingStateArr(filteredDataSourceArr);
          props.onInited?.();
        } catch (error) {
          console.error('加载表格配置失败:', error);
          // 如果出错且有默认数据源，使用默认配置
          if (props.getDefaultDataSource) {
            // 过滤默认配置中的操作列
            const defaultSetting = props.getDefaultDataSource(true)
              .filter(item => {
                if (!item) return false;

                // 使用类型断言安全访问属性
                const itemKey = (item as any).key;
                const itemDataIndex = (item as any).dataIndex;
                const itemTitle = item.title;

                // 判断是否为操作列
                const isOperationCol =
                  itemKey === 'operation' ||
                  itemDataIndex === 'operation' ||
                  (typeof itemTitle === 'string' &&
                    (itemTitle.includes('操作') ||
                      itemTitle.toLowerCase().includes('operation')));

                return !isOperationCol;
              });

            setMySettingStateArr(defaultSetting);
          }
        } finally {
          setIsLoading(false);
        }
      };

      loadTableConfig();
    }, [standardIdentifier]);

    const { actions } = props;

    if (isLoading) {
      return (
        <Flex align="center" className="size-full justify-center">
          <Spin />
        </Flex>
      );
    }

    if (mySettingStateArr.length === 0) {
      return (
        <Flex align="center" className="size-full justify-center">
          <Empty description={t('kysion.common.noData')} />
          {props.getDefaultDataSource && (
            <Button
              type="primary"
              onClick={() => {
                const defaultSetting = props.getDefaultDataSource!(true);
                updateSettingStateArr(defaultSetting);
              }}
            >
              {t('kysion.common.restoreDefault')}
            </Button>
          )}
        </Flex>
      );
    }

    const columnItems: ColumnsType<TableColumn> = [
      {
        title: t('kysion.table.column.title'),
        dataIndex: 'title',
        minWidth: 100,
        width: 100,
        align: 'center',
        render: (text, record: any) => {
          // 方案1: 优先尝试使用record.i18nTitle (用户可以在配置列时提供已翻译的标题)
          if (record.i18nTitle) {
            return (
              <Flex align="center" className="flex justify-center">
                {record.i18nTitle}
              </Flex>
            );
          }

          // 方案2: 尝试使用localeKey + t函数直接翻译
          if (record.localeKey) {
            const translated = t(record.localeKey);
            if (translated && translated !== record.localeKey) {
              return (
                <Flex align="center" className="flex justify-center">
                  {translated}
                </Flex>
              );
            }
            // 如果没有翻译成功，还是使用KyTranslate组件
            return (
              <Flex align="center" className="flex justify-center">
                <KyTranslate localeKey={record.localeKey} />
              </Flex>
            );
          }

          // 方案3: 尝试从dataIndex生成国际化键并翻译
          if (record.dataIndex) {
            const autoLocaleKey = `kysion.common.column.${record.dataIndex}`;
            const translatedText = t(autoLocaleKey);
            if (translatedText && translatedText !== autoLocaleKey) {
              return (
                <Flex align="center" className="flex justify-center">
                  {translatedText}
                </Flex>
              );
            }
          }

          // 方案4: 检查text是否是React元素且有localeKey
          if (text && typeof text === 'object' && 'props' in text && text.props?.localeKey) {
            return (
              <Flex align="center" className="flex justify-center">
                <KyTranslate localeKey={text.props.localeKey} />
              </Flex>
            );
          }

          // 方案5: 使用title或备用值
          const titleText = text || (record as any).key || 'Unnamed Column';

          return (
            <Flex align="center" className="flex justify-center">
              {!titleText ? 'Unnamed Column' : typeof titleText === 'string' ? titleText : titleText.props?.localeKey ? <KyTranslate localeKey={titleText.props.localeKey} /> : String(titleText)}
            </Flex>
          )
        },
      },
      {
        title: t('kysion.table.column.where'),
        dataIndex: 'where',
        minWidth: 100,
        width: 100,
        align: 'center',
        render: (text, row: any) => {
          if (!row.conf || row.conf.canWhere.length === 1) {
            return (
              <Flex align="center" className="flex justify-center">
                <Button disabled size="small">
                  {t(WhereMap[text as WhereSet] || 'kysion.query.Equal')}
                </Button>
              </Flex>
            );
          }

          const items: MenuProps['items'] = row.conf.canWhere.map((item: string, index: number) => {
            if (item === WhereSet.Like) {
              const subMenu = Object.keys(LikeWhereMap).map((likeItem, likeIndex) => {
                return {
                  key: `where-${index}-${likeIndex}`,
                  label: t(LikeWhereMap[likeItem as LikeWhereSet] || 'kysion.query.Like.Contain'),
                  onClick: () => {
                    const colIndex = mySettingStateArr.findIndex((v) => v.title === row.title);

                    if (colIndex >= 0) {
                      mySettingStateArr[colIndex] = {
                        ...mySettingStateArr[colIndex],
                        likeWhere: likeItem as LikeWhereSet,
                        where: item as WhereSet,
                      };
                    }

                    updateSettingStateArr(mySettingStateArr);
                  },
                };
              });

              return {
                key: `where-${index}`,
                label: t(WhereMap[item as WhereSet]),
                children: subMenu,
              };
            }
            return {
              key: `where-${index}`,
              label: t(WhereMap[item as WhereSet]),
              onClick: () => {
                const colIndex = mySettingStateArr.findIndex((v) => v.title === row.title);

                if (colIndex >= 0) {
                  mySettingStateArr[colIndex] = {
                    ...mySettingStateArr[colIndex],
                    where: item as WhereSet,
                  };
                }

                updateSettingStateArr(mySettingStateArr);
              },
            };
          });

          return (
            <Flex align="center" className="flex justify-center">
              <Dropdown
                menu={{
                  items,
                  selectable: false, // 禁用多选
                  selectedKeys: [text],
                }}
                trigger={['click']}
                arrow
              >
                <a onClick={(e) => e.preventDefault()}>
                  <Button
                    icon={<Icon icon={'tabler:chevron-down'} />}
                    size="small"
                    iconPosition="end"
                  >
                    {text !== 'like' && (
                      <Flex align="center">
                        {t(WhereMap[text as WhereSet] || 'kysion.query.Equal')}
                      </Flex>
                    )}

                    {text === 'like' && (
                      <Flex align="center">
                        {t(LikeWhereMap[row.likeWhere as LikeWhereSet] || 'kysion.query.Like.Contain')}
                      </Flex>
                    )}
                  </Button>
                </a>
              </Dropdown>
            </Flex>
          );
        },
      },
      {
        title: t('kysion.table.column.fixedSide'),
        dataIndex: 'fixed',
        minWidth: 100,
        width: 100,
        align: 'center',
        render: (text, row) => {
          if (!row.conf || !row.conf.fixed || row.conf.fixed?.length === 1) {
            return (
              <Flex align="center" className="flex justify-center">
                <Button disabled size="small">
                  {t(FixedStateMap.get(text) || 'kysion.table.column.fixedState.None')}
                </Button>
              </Flex>
            );
          }

          const items = FixedStateArr.map((item, index) => {
            return {
              key: index,
              label: t(item[1] || 'kysion.table.column.fixedState.None'),
              onClick: () => {
                const colIndex = mySettingStateArr.findIndex((v) => v.title === row.title);

                if (colIndex >= 0) {

                  // 更新列设置
                  const updatedState = {
                    ...mySettingStateArr[colIndex],
                    fixed: item[0]
                  };

                  // 更新到数组
                  mySettingStateArr[colIndex] = updatedState;
                }

                // 立即应用更新
                updateSettingStateArr([...mySettingStateArr], 0);

                // 添加一个立即刷新处理
                if (window && window.dispatchEvent) {
                  window.dispatchEvent(new CustomEvent('kysion:table:fixed-changed', {
                    detail: {
                      columnTitle: row.title,
                      newFixed: item[0]
                    }
                  }));
                }
              },
            } as any;
          });

          return (
            <Flex align="center" className="flex justify-center">
              <Dropdown
                menu={{ items, selectable: true, selectedKeys: [text] }}
                trigger={['click']}
                arrow
              >
                <a onClick={(e) => e.preventDefault()}>
                  <Button
                    icon={<Icon icon={'tabler:chevron-down'} />}
                    size="small"
                    iconPosition="end"
                  >
                    <Flex align="center">
                      {t(FixedStateMap.get(text) || 'kysion.table.column.fixedState.None')}
                    </Flex>
                  </Button>
                </a>
              </Dropdown>
            </Flex>
          );
        },
      },
      {
        title: t('kysion.table.column.visibility'),
        dataIndex: 'hidden',
        minWidth: 100,
        width: 100,
        align: 'center',
        render: (v, row: any) => (
          <Flex align="center" className="flex justify-center">
            <Switch
              checkedChildren={t('kysion.table.column.show')}
              unCheckedChildren={t('kysion.table.column.hidden')}
              checked={v !== true}
              onClick={(checked) => {
                const colIndex = mySettingStateArr.findIndex((item) => item.title === row.title);

                if (colIndex >= 0) {
                  mySettingStateArr[colIndex] = {
                    ...mySettingStateArr[colIndex],
                    hidden: !checked,
                  };
                }
                updateSettingStateArr(mySettingStateArr, 150);
              }}
            />
          </Flex>
        ),
      },
      {
        title: t('kysion.table.column.defaultSort'),
        dataIndex: 'sortBy',
        minWidth: 100,
        width: 100,
        align: 'center',
        render: (text, row) => {
          const sortByArr = Array.isArray(row.conf?.sortBy) ? row.conf?.sortBy : [row.conf?.sortBy];
          const items = sortByArr
            .filter((item) => item)
            .map((item, index) => {
              const result = {
                key: `sort-${item?.toString()}-${index}`,
                label: t(SortMap[(item as SortSet) ?? SortSet.None] || 'kysion.query.Sort.None'),
                checked: item === row.sortBy,
                onClick: () => {
                  const colIndex = mySettingStateArr.findIndex((v) => v.title === row.title);

                  if (colIndex >= 0) {
                    mySettingStateArr[colIndex] = {
                      ...mySettingStateArr[colIndex],
                      sortBy: item as SortSet,
                    };
                  }

                  updateSettingStateArr(mySettingStateArr);
                },
              };
              return result;
            });

          const defaultValue = text === true ? 'auto' : text;

          let isDisabled = sortByArr.length <= 1;
          if (sortByArr.length === 1 && sortByArr[0] === true) {
            isDisabled = false;
          }

          return (
            <Flex align="center" className="flex justify-center">
              <Dropdown
                menu={{ items, selectable: true, selectedKeys: [text] }}
                trigger={['click']}
                arrow
                disabled={isDisabled}
              >
                <Button
                  icon={<Icon icon={'tabler:chevron-down'} />}
                  size="small"
                  iconPosition="end"
                  onClick={(e) => e.preventDefault()}
                >
                  <Flex align="center">
                    {t(SortMap[(defaultValue as SortSet) ?? SortSet.None] || 'kysion.query.Sort.None')}
                  </Flex>
                </Button>
              </Dropdown>
            </Flex>
          );
        },
      },
      {
        title: t('kysion.table.column.groupSort'),
        dataIndex: 'sorter',
        minWidth: 100,
        width: 100,
        align: 'center',
        render: (v, row) => (
          <Flex align="center" className="flex justify-center">
            <Switch
              checkedChildren={t('kysion.common.yes')}
              unCheckedChildren={t('kysion.common.no')}
              checked={v === true}
              defaultChecked={v === true}
              disabled={row.sortBy === SortSet.None}
              onClick={(checked) => {
                const colIndex = mySettingStateArr.findIndex((item) => item.title === row.title);

                if (colIndex >= 0) {
                  mySettingStateArr[colIndex] = {
                    ...mySettingStateArr[colIndex],
                    sorter: checked,
                  };
                }

                updateSettingStateArr(mySettingStateArr);
              }}
            />
          </Flex>
        ),
      },
      {
        title: t('kysion.table.column.isDisabled'),
        dataIndex: 'disabled',
        minWidth: 100,
        width: 100,
        align: 'center',
        render: (v, row: any) => (
          <Flex align="center" className="flex justify-center">
            <Tooltip
              title={t('kysion.table.column.cell.tooltip') + (!row.title ? '' : typeof row.title === 'string' ? row.title : row.title.props?.localeKey ? row.title.props.localeKey : row.title)}
            >
              <Switch
                checkedChildren={t('kysion.common.yes')}
                unCheckedChildren={t('kysion.common.no')}
                checked={v === true}
                defaultChecked={v === true}
                onClick={(checked) => {
                  const colIndex = mySettingStateArr.findIndex((item) => {

                    return (item as any).key === row.key;
                  });

                  if (colIndex >= 0) {
                    mySettingStateArr[colIndex] = {
                      ...mySettingStateArr[colIndex],
                      disabled: checked,
                    };
                  }

                  updateSettingStateArr(mySettingStateArr);
                }}
              />
            </Tooltip>
          </Flex>
        ),
      },
      {
        title: t('kysion.table.column.sort'),
        dataIndex: 'sort',
        minWidth: 80,
        width: 80,
        align: 'center',
        render: () => (
          <Flex align="center" className="flex justify-center">
            <DragHandle />
          </Flex>
        ),
      },
    ];

    if (!isAdmin && !isSuperAdmin) {
      const posIndex = columnItems.findIndex(
        (v) => v.title === t('kysion.table.column.isDisabled'),
      );
      if (posIndex >= 0) columnItems.splice(posIndex, 1);
    }

    return (
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext
          items={mySettingStateArr.map(item => (item as any).key || item.title)}
          strategy={verticalListSortingStrategy}
        >
          <Table
            className="h-auto w-full flex-1"
            title={props.customHeader === true ? undefined : () => {
              if (typeof props.customHeader === 'function') return props.customHeader();
              if (props.customHeader) return props.customHeader;
              return (
                <Flex align="center" className="justify-between">
                  <Checkbox
                    checked={enablePreview || true}
                    disabled
                    className="font-size-16px m-l-2px"
                    onChange={(e) => {
                      canPreview = e.target.checked;
                      setEnablePreview(e.target.checked);
                      updateDataSource();
                    }}
                  >
                    {t('kysion.table.column.setting.preview')}
                  </Checkbox>
                  <span>{actions ?? makeActions()}</span>
                </Flex>
              );
            }}
            components={{
              body: { row: Row },
            }}
            size="middle"
            columns={columnItems}
            dataSource={mySettingStateArr.filter(item => (item as any).key !== 'operation')}
            pagination={false}
            rowKey={(record) => (record as any).key || record.title}
          />
        </SortableContext>
      </DndContext>
    );
  },
);

SettingTable.displayName = 'SettingTable';

export interface SettingTableDrawerRef {
  open(): void;
  close(): void;
}

export interface SettingTableDrawerProps extends SettingTableProps<any, any> {
  autoOpen?: boolean;
  onClose?: () => void;
}

export const SettingTableDrawer = forwardRef<SettingTableDrawerRef, SettingTableDrawerProps>(
  (props, ref) => {
    const ctlRef = createRef<SettingTableRef>();

    const [openState, setOpenState] = useState(false);
    const [actionState, setActionState] = useState<ReactNode>();
    const [contentState, setContentState] = useState<ReactNode>();

    const open = () => {
      setOpenState(true);
      setTimeout(() => {
        setContentState(
          <SettingTable
            ref={ctlRef}
            {...props}
            customHeader={true}
            onInited={() => {
              props.onInited?.();

              setActionState(ctlRef.current?.actions?.());
            }}
          />,
        );
      }, 100);
    };

    const onClose = () => {
      setOpenState(false);
      setContentState(<></>);
      props.onClose?.();
    };

    useImperativeHandle(ref, () => ({
      open,
      close: onClose,
    }));

    useEffect(() => {
      if (props.autoOpen) {
        open();
      }
    }, [props.autoOpen]);

    // if(ctlRef.current?.actions){
    //   setActionState(ctlRef.current?.actions?.());
    // }

    return (
      <>
        <Drawer
          title={props.title ?? 'ComponentTitle'}
          width={860}
          onClose={onClose}
          open={openState}
          extra={actionState}
          styles={{ body: { padding: 0, margin: 0 } }}
        >
          {contentState ?? (
            <Flex align="center" className="size-full justify-center">
              <Spin />
            </Flex>
          )}
        </Drawer>
      </>
    );
  },
);

SettingTableDrawer.displayName = 'SettingTableDrawer';
