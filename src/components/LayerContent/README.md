# LayerContent 层级内容管理组件

LayerContent 组件是一个用于管理全局弹窗、抽屉和模态框等层级内容的解决方案。它提供了统一的 API 来管理这些内容，避免了重复实现弹窗逻辑和状态管理的麻烦。

## 特性

- 🌟 统一的 API 接口，实现不同类型弹窗的一致管理
- 🔍 强类型支持，完整的 TypeScript 类型定义
- 🔄 兼容旧版 `window.$setTopLayerContent` API
- 🛠️ 提供 Modal、Drawer 等常用组件的便捷钩子
- 📦 集中管理层级内容，解决多个弹窗冲突和重叠问题
- 🔧 支持自定义标识符，方便特定场景下的内容更新和管理

## 安装

该组件已经包含在 `@kysion/core` 包中，无需单独安装。

## 基本用法

### 1. 在应用顶层添加 Provider

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { LayerContentProvider, GlobalLayerContentMethods } from '@kysion/core';
import App from './App';

ReactDOM.render(
  <LayerContentProvider>
    <GlobalLayerContentMethods />
    <App />
  </LayerContentProvider>,
  document.getElementById('root')
);
```

### 2. 使用 Modal

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

### 3. 使用 Drawer

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

### 4. 兼容旧版 API

LayerContent 组件提供了与旧版 `window.$setTopLayerContent` API 兼容的支持。当添加 `<GlobalLayerContentMethods />` 组件后，全局 `window.$setTopLayerContent` 方法将被自动注册。

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

### GlobalLayerContentMethods

注册全局 `window.$setTopLayerContent` 方法的组件，用于兼容旧版 API。

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
  const { showContent, updateContent } = useLayerContent();
  
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

## 最佳实践

1. 将 `LayerContentProvider` 放在应用的顶层，确保所有组件都能访问
2. 使用 `GlobalLayerContentMethods` 组件注册全局方法，兼容旧版 API
3. 优先使用提供的钩子函数（`useModal`、`useDrawer`等），而不是直接使用 `useLayerContent`
4. 为频繁使用的弹窗定义自己的钩子函数，提高代码复用性
5. 使用自定义标识符管理特定的弹窗，方便后续操作

## 注意事项

1. 必须在 `LayerContentProvider` 内部使用相关钩子函数
2. 直接使用 `window.$setTopLayerContent` 可能会导致类型安全问题，推荐使用提供的钩子函数
3. 弹窗内容应尽量独立，避免对外部状态的过度依赖
