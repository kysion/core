# KyTable 表格组件

## 简介

KyTable 是 @kysion/core 提供的一套功能强大的表格组件，用于高效展示和管理列表数据。该组件封装了基于 Ant Design 的表格，并扩展了更多实用功能，如数据状态管理、列配置、搜索过滤等，使开发者能够快速构建企业级表格应用。

## 功能特性

- 数据状态管理：集成 Zustand 状态库，提供表格数据的状态管理
- 列配置：支持列宽度调整、列显示/隐藏、列固定等功能
- 高级搜索：提供文本搜索过滤组件
- 数据排序：支持多字段排序
- 分页控制：内置分页逻辑
- 自定义操作：提供查看、编辑、删除等通用操作接口
- 类型安全：使用 TypeScript 开发，提供完整类型定义

## 目录结构

```
table/
├── components/                  # 组件文件夹
│   └── TableTextSarchFilter.tsx # 表格文本搜索过滤组件
├── hook/                        # 自定义钩子文件夹
│   └── useTable.ts              # 表格相关钩子
├── types.tsx                    # 类型定义
└── index.tsx                    # 组件入口
```

## 技术栈

- React
- TypeScript
- Ant Design 组件库
- Zustand 状态管理
- @kysion/utils 工具库
- @kysion/types 类型定义

## 主要组件和钩子

### useKyTable

提供表格逻辑和状态管理的主要钩子函数，用于初始化表格状态、列配置和分页逻辑等。

### TableTextSearchFilter

表格文本搜索过滤组件，用于在表格列头提供搜索过滤功能。

## 数据模型

表格组件使用以下核心数据模型：

- `ITableStateType`: 表格状态类型
- `TableParams`: 表格参数，包含分页、排序和过滤信息
- `KyTableColumnType`: 表格列配置类型
- `IKyTableListActions`: 表格操作接口定义

## 使用方法

### 基础用法

```tsx
import { useKyTable } from '@kysion/core';
import { Api } from '@kysion/api';

const YourComponent = () => {
  // 初始化表格存储
  const tableStore = useKyTable({
    identifier: 'your-table-identifier',
    makeColumns: (isDefault) => {
      // 定义表格列配置
      return [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
          width: 200,
        },
        // 更多列定义...
      ];
    },
    tableListActions: {
      // 实现必要的表格操作
      deleteInfo: async (id) => { /* 删除逻辑 */ },
      saveInfo: async (data) => { /* 保存逻辑 */ },
      getInfo: async (id) => { /* 获取详情逻辑 */ },
    }
  });
  
  // 在组件中使用表格
  return (
    <Table
      rowKey="id"
      columns={tableStore.columnStateArr}
      dataSource={tableStore.dataSource}
      loading={tableStore.isLoading}
      // 其他配置
    />
  );
};
```

### 带搜索过滤的列配置

```tsx
import { useKyTable, TableTextSearchFilter } from '@kysion/core';

const YourComponent = () => {
  // 表格列配置
  const makeColumns = (isDefault) => {
    return [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        // 添加搜索过滤功能
        filterDropdown: (props) => (
          <TableTextSearchFilter
            title="名称"
            dataIndex="name"
            onFilter={props}
            onPassEnter={(selectedKeys, confirm, dataIndex) => {
              confirm();
              // 处理搜索逻辑
            }}
          />
        ),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
      },
      // 更多列...
    ];
  };
  
  // 初始化表格存储
  const tableStore = useKyTable({
    identifier: 'your-table-identifier',
    makeColumns,
    // 其他配置...
  });
  
  // 在组件中使用
};
```

## API 参考

### useKyTable 钩子

| 参数 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| props.identifier | string | 是 | 表格标识符，用于持久化状态 |
| props.makeColumns | (isDefault: boolean) => any[] | 是 | 创建表格列配置的函数 |
| props.tableListActions | IKyTableListActions<T> | 是 | 表格操作函数集合 |
| props.columnWidths | Record<string, number> | 否 | 列宽度配置 |
| props.columnFilters | object | 否 | 列过滤器配置 |

返回值:

```typescript
{
  identifier: string;                // 表格标识符  
  initColumns: () => void;           // 初始化列配置
  columnStateArr: KyTableColumnType<T, K>[]; // 列状态数组
  setColumnStateArr: (value) => void;// 设置列状态
  makeColumns: (isDefault?) => any[];// 创建列配置
  getPageSize: () => number;         // 获取页面大小
  setPageSize: (pageSize) => void;   // 设置页面大小
}
```

### TableTextSearchFilter 组件

| 属性名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| title | string | 是 | 列标题 |
| dataIndex | keyof T | 是 | 数据索引 |
| onFilter | FilterDropdownProps | 是 | 过滤器属性 |
| onPassEnter | function | 否 | 按回车键时触发函数 |
| onReset | function | 否 | 重置过滤器时触发函数 |
| className | string | 否 | 自定义类名 |

### IKyTableListActions 接口

核心的表格操作接口：

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
| deleteInfo | 删除数据项 | id: number | Promise<IKyTableActionResult> |
| saveInfo | 保存数据项 | data: Partial<T> | Promise<boolean> |
| getInfo | 获取详情 | id: number | Promise<T \| null> |
| handleView | 查看详情 | id: number | void |
| handleEdit | 编辑数据 | id: number | void |
| refresh | 刷新表格 | - | void |

## 常见问题

1. **如何保存用户的列宽度偏好？**

   表格组件会自动通过 identifier 保存用户的列宽度偏好。确保为每个表格提供唯一的 identifier。

2. **如何实现自定义的过滤逻辑？**

   可以通过 columnFilters 属性提供自定义的过滤逻辑，或者在 makeColumns 函数中为列配置自定义的 filterDropdown。

3. **如何处理大数据量表格？**

   建议使用分页加载，并通过 TableParams 中的 pagination 配置分页参数。

## 示例项目

可以参考 `ky-admin-web/src/pages/organization/baseCompany` 目录下的实现，该目录展示了如何使用表格组件构建完整的公司管理模块。

## 注意事项

1. 确保提供唯一的 identifier 以避免状态混淆
2. 实现必要的 tableListActions 方法
3. 根据数据类型定义正确的泛型参数
4. 建议使用自定义钩子封装表格操作逻辑，提高代码复用性
