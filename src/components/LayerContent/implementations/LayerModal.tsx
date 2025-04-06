import React, { useCallback } from 'react';
import { message } from 'antd';
import { DraggableModal } from '../../DraggableModal';
import { ModalOptions } from '../types';
import { useLayerContent } from '../CoreLayerContentProvider';

/**
 * LayerModal组件 - 用于渲染模态框
 */
const LayerModal: React.FC<{
    options: ModalOptions;
    onClose: () => void;
}> = React.memo(({ options, onClose }) => {
    const handleOk = async () => {
        try {
            if (options.onOk) {
                await options.onOk();
            }
            onClose();
        } catch (error) {
            console.error('Modal onOk error:', error);
            message.error('操作失败');
        }
    };

    // 确定是否显示默认按钮
    const showOkButton = options.showOkButton !== false;
    const showCancelButton = options.showCancelButton !== false;

    return (
        <DraggableModal
            title={options.title}
            open={true}
            width={options.width || 520}
            onOk={handleOk}
            onCancel={onClose}
            maskClosable={false}
            destroyOnClose={true}
            footer={options.footer}
            okText={options.okText}
            cancelText={options.cancelText}
            okButtonProps={{ style: { display: showOkButton ? 'inline-block' : 'none' } }}
            cancelButtonProps={{ style: { display: showCancelButton ? 'inline-block' : 'none' } }}
        >
            {typeof options.content === 'function'
                ? options.content(onClose)
                : options.content}
        </DraggableModal>
    );
});

/**
 * 使用模态框的钩子
 * @returns 显示模态框的函数
 */
export const useModal = () => {
    const { showContent, hideContent } = useLayerContent();

    return useCallback((options: ModalOptions): React.Key => {
        const id = options.identifier || `modal-${Date.now()}`;

        const handleClose = () => {
            hideContent(id);
            options.onCancel?.();
        };

        showContent({
            identifier: id,
            zIndex: options.zIndex,
            child: <LayerModal options={options} onClose={handleClose} />
        });

        return id;
    }, [showContent, hideContent]);
};

export default LayerModal; 