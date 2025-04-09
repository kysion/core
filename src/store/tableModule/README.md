# TableModule 通用表格模块

TableModule 是一个基于 Zustand 状态管理库实现的可复用通用表格数据管理模块。它专为处理与表格相关的状态和操作而设计，如加载状态、查询参数、分页配置和数据源等。通过 TypeScript 泛型支持，可以适用于任何具有 id 字段的数据类型。

## 特性

- 🚀 **高性能**：基于轻量级的 Zustand 状态管理
- 🔄 **类型安全**：完整的 TypeScript 类型支持
- 📦 **零依赖**：除核心库外无额外依赖
- 🧩 **可扩展**：易于扩展和定制
- 🎯 **专注**：专为表格数据管理设计
- 🔌 **即插即用**：简单配置即可使用

## 安装

TableModule 已经内置在 @kysion/core 包中，可直接引入使用：

```typescript
import { createTableModule } from '@kysion/core';
```

## 基本用法

### 创建表格模块

```typescript
import { createTableModule } from '@kysion/core';
import { YourEntityType } from '@kysion/types';

// 创建表格模块
const yourEntityModule = createTableModule<YourEntityType>({
  name: 'yourEntity',
  getApi: {
    fetchList: (params) => YourApi.fetchYourEntityList(params)
  }
});

// 导出 hooks
export const useYourEntityStore = yourEntityModule.store;
export const useYourEntityState = yourEntityModule.state;
export const useYourEntityActions = yourEntityModule.actions;
```

### 在组件中使用

```typescript
import React, { useEffect } from 'react';
import { Table } from 'antd';
import { useYourEntityState, useYourEntityActions } from './yourEntityModule';

const YourEntityList: React.FC = () => {
  // 获取状态
  const { isLoading, dataSource, tableParams } = useYourEntityState();
  // 获取操作方法
  const actions = useYourEntityActions();

  // 组件挂载时加载数据
  useEffect(() => {
    actions().fetchList();
  }, []);

  // 处理表格变化
  const handleTableChange = (pagination, filters, sorter) => {
    actions().setTableParams({ pagination, filters, sorter });
    actions().fetchList();
  };

  return (
    <Table
      loading={isLoading}
      dataSource={dataSource.records}
      pagination={tableParams.pagination}
      onChange={handleTableChange}
      // ... 其他属性
    />
  );
};

export default YourEntityList;
```

## 实际应用案例

### 公司模块实现

以下是使用 TableModule 实现的公司模块示例：

```typescript
// packages/core/src/store/company/headCompany.ts
import { KysionApis } from "../../api";
import { CompanyInfoType, Query } from "@kysion/types";
import { createTableModule } from "../tableModule/tableModule";

// 创建总部公司模块
export const headCompanyModule = createTableModule<CompanyInfoType>({
  name: 'headCompany',
  getApi: {
    fetchList: (params: Query) => KysionApis.Org.HeadCompany.fetchCompanyList(params)
  }
});

// 导出 hooks
export const useHeadCompanyStore = headCompanyModule.store;
export const useHeadCompanyState = headCompanyModule.state;
export const useHeadCompanyActions = headCompanyModule.actions;
```

### 员工模块实现

以下是使用 TableModule 实现的员工模块示例：

```typescript
// packages/core/src/store/employee/headEmployee.ts
import { KysionApis } from "../../api";
import { EmployeeInfoType, Query } from "@kysion/types";
import { createTableModule } from "../tableModule/tableModule";

// 创建总部员工模块
export const headEmployeeModule = createTableModule<EmployeeInfoType>({
  name: 'headEmployee',
  getApi: {
    fetchList: (params: Query) => KysionApis.Org.HeadCompany.employee.queryEmployeeList(params)
  }
});

// 导出 hooks
export const useHeadEmployeeStore = headEmployeeModule.store;
export const useHeadEmployeeState = headEmployeeModule.state;
export const useHeadEmployeeActions = headEmployeeModule.actions;
```

### 在页面中使用

```tsx
// pages/organization/headCompany/index.tsx
import React, { useEffect } from 'react';
import { Table, Button, Space } from 'antd';
import { useHeadCompanyState, useHeadCompanyActions } from '@kysion/core';
import { CompanyInfoType } from '@kysion/types';

const HeadCompanyList: React.FC = () => {
  const { isLoading, dataSource, tableParams } = useHeadCompanyState();
  const actions = useHeadCompanyActions();

  useEffect(() => {
    actions().fetchList();
  }, []);

  const columns = [
    {
      title: '公司名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName',
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      render: (state: number) => state === 1 ? '正常' : '停用',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: CompanyInfoType) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: CompanyInfoType) => {
    // 编辑操作
    console.log('编辑', record);
  };

  const handleDelete = async (id: React.Key) => {
    try {
      await KysionApis.Org.HeadCompany.deleteCompany({ id });
      actions().removeItem(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  return (
    <div>
      <Button type="primary" style={{ marginBottom: 16 }}>
        新增公司
      </Button>
      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={dataSource.records}
        pagination={tableParams.pagination}
        onChange={(pagination, filters, sorter) => {
          actions().setTableParams({ pagination, filters, sorter });
          actions().fetchList();
        }}
      />
    </div>
  );
};

export default HeadCompanyList;
```

## API 文档

### `createTableModule<T>`

创建通用表格模块的工厂函数。

**类型参数**

- `T`：表格数据类型，必须包含 `id: React.Key` 字段

**参数**

- `config: BaseTableConfig<T>`：表格模块配置

**返回值**

- `IBaseTableStore<T>`：表格 Store 对象，包含 store 实例、状态选择器和操作方法

### BaseTableConfig 接口

```typescript
interface BaseTableConfig<T extends { id: React.Key }> {
  /**
   * 存储名称，用于持久化和调试
   */
  name: string;

  /**
   * API对象，包含获取列表数据的方法
   */
  getApi: {
    /**
     * 获取列表数据的方法
     */
    fetchList: (params: any) => Promise<Records<T>>;
  };
}
```

### IBaseTableStateType 接口

```typescript
interface IBaseTableStateType<T> {
  /**
   * 加载状态标志
   */
  isLoading: boolean;

  /**
   * 查询参数
   */
  queryParams: Query;

  /**
   * 表格参数（包含分页、排序等）
   */
  tableParams: TableParams;

  /**
   * 表格数据源
   */
  dataSource: Records<T>;
}
```

### IBaseTableStore 接口

```typescript
interface IBaseTableStore<T> {
  /**
   * Zustand store实例
   */
  store: UseBoundStore<StoreApi<IBaseTableStateType<T>>>;

  /**
   * 状态选择器，用于获取状态中的特定字段
   */
  state: ReturnType<typeof createSelectors<UseBoundStore<StoreApi<IBaseTableStateType<T>>>>>;

  /**
   * 表格操作方法，返回一组用于操作表格状态的函数
   */
  actions: () => IKyTableActions<T>;
}
```

### 可用操作方法 (IKyTableActions)

| 方法名 | 描述 | 参数 | 返回值 |
|--------|------|------|--------|
| `setQueryParams` | 设置查询参数 | `queryParams: Partial<Query>` | `void` |
| `setLoading` | 设置加载状态 | `isLoading: boolean` | `void` |
| `setTableParams` | 设置表格参数 | `tableParams: Partial<TableParams>` | `void` |
| `removeItem` | 移除指定id的数据项 | `id: React.Key` | `void` |
| `fetchList` | 获取列表数据 | `queryParams?: Partial<Query>` | `Promise<Records<T>>` |

## 最佳实践

### 模块组织方式

推荐将相关模块分组置于各自的文件夹中：

```
src/
  store/
    entityName/
      index.ts         # 导出所有内容
      entityModule.ts  # 使用tableModule创建的实体模块
```

### 常见场景

#### 条件查询

```typescript
// 在组件中
const handleSearch = (values) => {
  actions().setQueryParams(values);
  actions().fetchList();
};
```

#### 刷新数据

```typescript
const refreshData = () => {
  actions().fetchList(get().queryParams);
};
```

#### 删除数据后更新列表

```typescript
const handleDelete = async (id) => {
  await YourApi.deleteEntity(id);
  // 方式1: 仅从本地移除
  actions().removeItem(id);
  
  // 方式2: 重新获取数据
  actions().fetchList();
};
```

## 高级用法

### 扩展基础模块

如果需要添加特定操作，可以扩展基本模块：

```typescript
import { createTableModule, IBaseTableStore } from '@kysion/core';

// 创建基础模块
const baseModule = createTableModule<YourType>({...});

// 扩展特定操作
const extendedActions = () => {
  const baseActions = baseModule.actions();
  const { getState, setState } = baseModule.store;

  return {
    ...baseActions,
    
    // 添加自定义方法
    customAction() {
      // 实现自定义逻辑
    }
  };
};

// 导出扩展后的模块
export const useCustomStore = baseModule.store;
export const useCustomState = baseModule.state;
export const useCustomActions = () => extendedActions();
```

### 持久化存储

TableModule 支持通过 name 属性进行持久化：

```typescript
const module = createTableModule<T>({
  name: 'persistedEntityName',
  // ...其他配置
});
```

## 注意事项与限制

1. 数据类型必须包含 `id: React.Key` 字段
2. API 方法必须返回符合 `Records<T>` 类型的数据结构
3. 默认分页配置为每页20条，如需修改请使用 `setTableParams`

## 贡献与反馈

如果您在使用过程中发现任何问题或有改进建议，请通过内部工单系统反馈或联系项目维护者。

## 许可证

内部使用，未经授权禁止外部分发。
