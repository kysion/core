# LayerContent 层级内容管理组件

LayerContent 组件是一个用于管理全局弹窗、抽屉和模态框等层级内容的解决方案。它提供了统一的 API 来管理这些内容，避免了重复实现弹窗逻辑和状态管理的麻烦。

## 特性

- 🌟 统一的 API 接口，实现不同类型弹窗的一致管理
- 🔍 强类型支持，完整的 TypeScript 类型定义
- 🔄 兼容旧版 `window.$setTopLayerContent` API
- 🛠️ 提供 Modal、Drawer 等常用组件的便捷钩子
- 📦 集中管理层级内容，解决多个弹窗冲突和重叠问题
- 🔧 支持自定义标识符，方便特定场景下的内容更新和管理
- 🚀 性能优化，使用 React.memo 和 useMemo 减少不必要的重渲染
- 🧩 模块化设计，分离关注点，便于扩展和维护
- 💡 支持Hook和全局方法两种使用方式，满足不同场景需求

## 安装

该组件已经包含在 `@kysion/core` 包中，无需单独安装。

## 基本用法

### 1. 在应用顶层添加 Provider

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { LayerContentProvider, GlobalLayerMethods } from '@kysion/core';
import App from './App';

ReactDOM.render(
  <LayerContentProvider>
    <GlobalLayerMethods />
    <App />
  </LayerContentProvider>,
  document.getElementById('root')
);
```

### 2. Hook方式使用 Modal

```tsx
import React from 'react';
import { Button } from 'antd';
import { useModal } from '@kysion/core';

const MyComponent = () => {
  const showModal = useModal();
  
  const handleClick = () => {
    showModal({
      title: '确认操作',
      content: '确定要执行此操作吗？',
      onOk: async () => {
        // 处理确认操作
        await doSomething();
      },
    });
  };
  
  return (
    <Button onClick={handleClick}>打开弹窗</Button>
  );
};
```

### 3. Hook方式使用 Drawer

```tsx
import React from 'react';
import { Button } from 'antd';
import { useDrawer } from '@kysion/core';
import DetailForm from './DetailForm';

const MyComponent = () => {
  const showDrawer = useDrawer();
  
  const handleClick = () => {
    showDrawer({
      title: '详情信息',
      width: 600,
      content: (close) => (
        <DetailForm 
          id="123" 
          onSuccess={() => {
            // 操作成功后关闭抽屉
            close();
          }} 
        />
      ),
    });
  };
  
  return (
    <Button onClick={handleClick}>查看详情</Button>
  );
};
```

### 4. 简化方式使用全局通知和消息

```tsx
// 直接使用全局方法
window.$message?.success('操作成功');
window.$message?.error('操作失败');
window.$message?.warning('警告信息');
window.$message?.info('提示信息');

window.$notification?.success({
  message: '操作成功',
  description: '您的操作已成功完成',
});
```

### 5. 简化方式使用模态框和抽屉

```tsx
// 使用全局方法显示模态框
window.$modal?.show({
  title: '确认操作',
  content: '确定要执行此操作吗？',
  onOk: async () => {
    await doSomething();
  }
});

// 使用全局方法显示抽屉
window.$drawer?.show({
  title: '详情信息',
  width: 600,
  content: (close) => (
    <DetailForm 
      id="123" 
      onSuccess={() => {
        close();
      }} 
    />
  )
});
```

### 6. 兼容旧版 API

LayerContent 组件提供了与旧版 `window.$setTopLayerContent` API 兼容的支持。当添加 `<GlobalLayerMethods />` 组件后，全局 `window.$setTopLayerContent` 方法将被自动注册。

```tsx
// 旧版代码仍然可以正常工作
window.$setTopLayerContent?.(
  <MyDrawer
    onClose={() => {
      window.$setTopLayerContent?.(undefined, 'my-drawer');
    }}
  />,
  'my-drawer'
);
```

## API 文档

### LayerContentProvider

全局层级内容管理的上下文提供者组件。

| 属性      | 说明                 | 类型                | 默认值 |
| --------- | -------------------- | ------------------- | ------ |
| children  | 子组件               | ReactNode           | -      |

### useLayerContent

获取层级内容上下文的钩子函数。

返回对象：

| 属性            | 说明                 | 类型                                                                   |
| --------------- | -------------------- | ---------------------------------------------------------------------- |
| showContent     | 显示内容             | (content: Omit<LayerContentItem, 'identifier'> & { identifier?: React.Key }) => React.Key |
| hideContent     | 隐藏内容             | (identifier: React.Key) => void                                        |
| updateContent   | 更新内容             | (identifier: React.Key, content: Partial<LayerContentItem>) => void    |
| contents        | 当前显示的所有内容   | LayerContentItem[]                                                     |

### useModal

便捷使用模态框的钩子函数。

参数：

| 属性        | 说明                 | 类型                                    | 默认值    |
| ----------- | ------------------- | --------------------------------------- | --------- |
| title       | 标题                | string                                  | -         |
| content     | 内容                | ReactNode                               | -         |
| onOk        | 确认回调            | () => Promise<void> &#124; void         | -         |
| onCancel    | 取消回调            | () => void                              | -         |
| width       | 宽度                | number                                  | 520       |
| identifier  | 唯一标识符          | React.Key                               | 自动生成   |
| zIndex      | 层级                | number                                  | 1000      |

### useDrawer

便捷使用抽屉的钩子函数。

参数：

| 属性        | 说明                 | 类型                                                   | 默认值    |
| ----------- | ------------------- | ------------------------------------------------------ | --------- |
| title       | 标题                | string                                                 | -         |
| content     | 内容                | ReactNode &#124; ((close: () => void) => ReactNode)    | -         |
| onClose     | 关闭回调            | () => void                                             | -         |
| width       | 宽度                | number                                                 | 500       |
| placement   | 位置                | 'left' &#124; 'right' &#124; 'top' &#124; 'bottom'     | 'right'   |
| identifier  | 唯一标识符          | React.Key                                              | 自动生成   |
| zIndex      | 层级                | number                                                 | 1000      |

### GlobalLayerMethods

注册全局方法的组件，用于兼容旧版 API 和提供全局通知消息方法。

### 全局方法

注册 `<GlobalLayerMethods />` 后，可以使用以下全局方法：

| 全局变量               | 说明                 | 类型                                     |
| --------------------- | -------------------- | ---------------------------------------- |
| window.$message       | 全局消息方法         | MessageInstance                          |
| window.$notification  | 全局通知方法         | NotificationInstance                     |
| window.$modal         | 全局模态框方法       | { show: (options: ModalOptions) => React.Key } |
| window.$drawer        | 全局抽屉方法         | { show: (options: DrawerOptions) => React.Key } |
| window.$setTopLayerContent | 旧版兼容方法    | (child: ReactNode, identifier?: React.Key) => void |

## 高级用法

### 1. 自定义标识符

在需要更新或关闭特定弹窗时，可以使用自定义标识符：

```tsx
const MyComponent = () => {
  const showDrawer = useDrawer();
  const { hideContent } = useLayerContent();
  
  useEffect(() => {
    // 打开特定标识符的抽屉
    const id = showDrawer({
      title: '详情信息',
      identifier: 'user-detail-123',
      content: <UserDetail userId="123" />,
    });
    
    // 在某些条件下关闭
    return () => {
      hideContent(id);
    };
  }, []);
  
  // 在其他地方可以通过标识符关闭
  const handleClose = () => {
    hideContent('user-detail-123');
  };
  
  return <Button onClick={handleClose}>关闭详情</Button>;
};
```

### 2. 更新内容

可以使用 `updateContent` 方法更新已存在的内容：

```tsx
const MyComponent = () => {
  const { showContent, updateContent, hideContent } = useLayerContent();
  
  const showLoading = () => {
    const id = showContent({
      identifier: 'loading-indicator',
      child: <div>Loading...</div>,
    });
    
    // 5秒后更新内容
    setTimeout(() => {
      updateContent(id, {
        child: <div>Loading completed!</div>,
      });
      
      // 再过2秒后删除内容
      setTimeout(() => {
        hideContent(id);
      }, 2000);
    }, 5000);
  };
  
  return <Button onClick={showLoading}>显示加载</Button>;
};
```

### 3. 创建自定义层级内容组件

可以创建自己的层级内容组件，使用 `useLayerContent` 钩子：

```tsx
import React, { useCallback } from 'react';
import { useLayerContent } from '@kysion/core';

// 自定义选项接口
interface CustomLayerOptions {
  title: string;
  content: React.ReactNode;
  identifier?: React.Key;
  zIndex?: number;
}

// 自定义组件
const CustomLayer: React.FC<{
  options: CustomLayerOptions;
  onClose: () => void;
}> = React.memo(({ options, onClose }) => {
  return (
    <div className="custom-layer">
      <div className="custom-layer-header">
        <h3>{options.title}</h3>
        <button onClick={onClose}>关闭</button>
      </div>
      <div className="custom-layer-content">
        {options.content}
      </div>
    </div>
  );
});

// 自定义钩子
export const useCustomLayer = () => {
  const { showContent, hideContent } = useLayerContent();
  
  return useCallback((options: CustomLayerOptions) => {
    const id = options.identifier || `custom-${Date.now()}`;
    
    const handleClose = () => {
      hideContent(id);
    };
    
    showContent({
      identifier: id,
      zIndex: options.zIndex,
      child: <CustomLayer options={options} onClose={handleClose} />,
    });
    
    return id;
  }, [showContent, hideContent]);
};
```

### 4. 两种使用方式的选择

- **Hook方式**: 在React组件内使用，类型安全，适合组件内逻辑处理
- **全局方法**: 适合非React环境或简化调用，如工具函数、全局错误处理等场景

```tsx
// 在工具函数或全局错误处理中使用全局方法
const handleApiError = (error) => {
  window.$message?.error('请求出错: ' + error.message);
};

// 在React组件中使用Hook
const UserForm = () => {
  const message = useMessage();
  
  const handleSubmit = () => {
    try {
      // 处理逻辑
      message.success('提交成功');
    } catch (error) {
      message.error('提交失败');
    }
  };
  
  return <Form onSubmit={handleSubmit}>...</Form>;
};
```

## 架构设计

LayerContent 组件采用了分层设计模式，具有以下几个主要部分：

1. **核心层 (Core Layer)**：负责管理层级内容的状态和基本操作，提供 Context API
2. **提供者层 (Provider Layer)**：封装不同类型的提供者组件，如通知、消息等
3. **实现层 (Implementation Layer)**：提供具体的 UI 组件实现，如模态框、抽屉等
4. **钩子层 (Hook Layer)**：提供便捷的 Hook API 供外部使用
5. **全局层 (Global Layer)**：提供全局方法，兼容旧版 API

这种设计使得组件具有良好的扩展性和维护性，同时保持高度的灵活性。

## 最佳实践

1. 将 `LayerContentProvider` 放在应用的顶层，确保所有组件都能访问
2. 使用 `GlobalLayerMethods` 组件注册全局方法，兼容旧版 API
3. 在React组件中优先使用Hook方式（`useModal`、`useDrawer`等），获得更好的类型安全
4. 在全局工具函数、异步回调等场景中使用全局方法（`window.$message`等）
5. 为频繁使用的弹窗定义自己的钩子函数，提高代码复用性
6. 使用自定义标识符管理特定的弹窗，方便后续操作
7. 在弹窗内容组件中实现内部状态管理，减少外部依赖

## 注意事项

1. 必须在 `LayerContentProvider` 内部使用相关钩子函数
2. 直接使用全局方法时要注意可能的空值情况（使用可选链操作符 `?.`）
3. 弹窗内容应尽量独立，避免对外部状态的过度依赖
4. 避免过多的嵌套弹窗，会导致用户体验下降
5. 注意合理设置 zIndex 值，避免层级混乱

## 内部实现说明

LayerContent 组件内部使用了 React Context API 来管理状态，并通过 React.memo 和 useMemo 进行了性能优化。组件的主要工作流程如下：

1. `LayerContentProvider` 创建上下文环境
2. `useLayerContent` 提供核心操作方法 (showContent, hideContent, updateContent)
3. 特定组件钩子 (useModal, useDrawer) 在内部使用 useLayerContent 并提供便捷API
4. 全局方法通过 useEffect 注册到 window 对象上

通过全局方法和Hook两种使用方式的结合，满足了不同场景的使用需求。

## 版本历史

- **v2.0.0**：重构架构，优化性能，增强扩展性，增加全局方法支持
- **v1.0.0**：初始版本，提供基本功能
