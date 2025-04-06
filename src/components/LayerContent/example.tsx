import React, { useState } from 'react';
import { Button, Form, Input, Space, Typography } from 'antd';
import { ModelContentProvider, GlobalLayerContentMethods, useDrawer, useModal, useLayerContent } from './index';

const { Title, Paragraph } = Typography;

/**
 * 示例表单组件
 */
const DemoForm: React.FC<{ onSave: (data: any) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [form] = Form.useForm();

    return (
        <Form form={form} layout="vertical" onFinish={onSave}>
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}>
                <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">保存</Button>
                    <Button onClick={onCancel}>取消</Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

/**
 * 使用Modal的示例组件
 */
const ModalDemo: React.FC = () => {
    const showModal = useModal();

    const handleOpenModal = () => {
        showModal({
            title: '确认操作',
            content: '这是一个模态框示例，您确定要执行此操作吗？',
            onOk: async () => {
                console.log('用户点击了确认');
                // 模拟异步操作
                await new Promise(resolve => setTimeout(resolve, 1000));
            },
            onCancel: () => {
                console.log('用户取消了操作');
            }
        });
    };

    return (
        <div>
            <Title level={5}>Modal示例</Title>
            <Paragraph>点击按钮打开一个确认对话框</Paragraph>
            <Button type="primary" onClick={handleOpenModal}>打开对话框</Button>
        </div>
    );
};

/**
 * 使用Drawer的示例组件
 */
const DrawerDemo: React.FC = () => {
    const showDrawer = useDrawer();
    const [result, setResult] = useState<Record<string, any> | null>(null);

    const handleOpenDrawer = () => {
        showDrawer({
            title: '表单示例',
            width: 600,
            content: (close) => (
                <DemoForm
                    onSave={(data) => {
                        console.log('表单数据:', data);
                        setResult(data);
                        close();
                    }}
                    onCancel={close}
                />
            )
        });
    };

    return (
        <div>
            <Title level={5}>Drawer示例</Title>
            <Paragraph>点击按钮打开一个包含表单的抽屉</Paragraph>
            <Button type="primary" onClick={handleOpenDrawer}>打开表单</Button>

            {result && (
                <div style={{ marginTop: 16, padding: 16, background: '#f0f2f5', borderRadius: 4 }}>
                    <Title level={5}>提交的数据:</Title>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

/**
 * 传统API示例组件
 */
const LegacyApiDemo: React.FC = () => {
    const handleUseOldApi = () => {
        // 使用旧版API显示内容
        window.$setTopLayerContent?.(
            <div style={{ background: 'white', padding: 20, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <Title level={4}>旧版API示例</Title>
                <Paragraph>这是使用旧版API显示的内容</Paragraph>
                <Button
                    type="primary"
                    onClick={() => window.$setTopLayerContent?.(undefined, 'legacy-content')}
                >
                    关闭
                </Button>
            </div>,
            'legacy-content'
        );
    };

    return (
        <div>
            <Title level={5}>旧版API示例</Title>
            <Paragraph>点击按钮使用window.$setTopLayerContent方法</Paragraph>
            <Button type="primary" onClick={handleUseOldApi}>使用旧版API</Button>
        </div>
    );
};

/**
 * 高级用法示例
 */
const AdvancedDemo: React.FC = () => {
    const { showContent, hideContent, updateContent } = useLayerContent();
    const [counter, setCounter] = useState(0);

    const handleShowUpdatingContent = () => {
        // 显示一个会自动更新的内容
        const id = showContent({
            identifier: 'updating-content',
            child: (
                <div style={{ background: 'white', padding: 20, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <Title level={4}>动态内容</Title>
                    <Paragraph>计数器: {counter}</Paragraph>
                    <Space>
                        <Button onClick={() => setCounter(c => c + 1)}>增加</Button>
                        <Button onClick={() => hideContent('updating-content')}>关闭</Button>
                    </Space>
                </div>
            )
        });

        // 5秒后自动更新内容
        setTimeout(() => {
            updateContent(id, {
                child: (
                    <div style={{ background: 'white', padding: 20, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        <Title level={4}>已更新的内容</Title>
                        <Paragraph>这个内容已经被自动更新了</Paragraph>
                        <Button
                            type="primary"
                            onClick={() => hideContent(id)}
                        >
                            关闭
                        </Button>
                    </div>
                )
            });
        }, 5000);
    };

    return (
        <div>
            <Title level={5}>高级用法示例</Title>
            <Paragraph>展示自动更新内容的功能</Paragraph>
            <Button type="primary" onClick={handleShowUpdatingContent}>显示动态内容</Button>
        </div>
    );
};

/**
 * 完整的示例应用
 */
export const LayerContentExample: React.FC = () => {
    return (
        <ModelContentProvider>
            <GlobalLayerContentMethods />

            <Typography>
                <Title>LayerContent 组件示例</Title>
                <Paragraph>
                    这个示例展示了LayerContent组件的各种用法。LayerContent提供了统一的API来管理弹窗、抽屉和模态框等层级内容。
                </Paragraph>
            </Typography>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 24 }}>
                <ModalDemo />
                <DrawerDemo />
                <LegacyApiDemo />
                <AdvancedDemo />
            </div>
        </ModelContentProvider>
    );
}; 