import React, { useEffect, useRef, useState } from 'react';
import { Modal, ModalProps } from 'antd';
import './index.less';

interface DraggableModalProps extends ModalProps {
    children: React.ReactNode;
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
    title,
    children,
    open,
    ...modalProps
}) => {
    const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | null>(null);
    const dragRef = useRef({ startX: 0, startY: 0, isDragging: false });

    // 计算居中位置
    const calculateCenterPosition = () => {
        if (typeof window === 'undefined') return { x: 0, y: 0 };

        const modalWidth = typeof modalProps.width === 'number' ? modalProps.width : 520;
        return {
            x: Math.max(0, (window.innerWidth - modalWidth) / 2),
            y: Math.max(0, window.innerHeight / 6.7)
        };
    };

    // 监听弹窗打开状态
    useEffect(() => {
        // 只在首次打开时设置居中位置
        if (open && !modalPosition) {
            setModalPosition(calculateCenterPosition());
        }
    }, [open]);

    // 监听窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            if (open && !dragRef.current.isDragging && !modalPosition) {
                setModalPosition(calculateCenterPosition());
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [open]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('ant-modal-header') || target.closest('.ant-modal-header')) {
            const currentPosition = modalPosition || calculateCenterPosition();
            dragRef.current = {
                startX: e.pageX - currentPosition.x,
                startY: e.pageY - currentPosition.y,
                isDragging: true
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (dragRef.current.isDragging) {
            const modalWidth = typeof modalProps.width === 'number' ? modalProps.width : 520;
            const newX = Math.max(0, Math.min(e.pageX - dragRef.current.startX, window.innerWidth - modalWidth));
            const newY = Math.max(0, Math.min(e.pageY - dragRef.current.startY, window.innerHeight - 400));
            setModalPosition({ x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        dragRef.current.isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const currentPosition = modalPosition || calculateCenterPosition();

    return (
        <Modal
            {...modalProps}
            open={open}
            title={
                <div
                    className="draggable-modal-title"
                    onMouseDown={handleMouseDown}
                >
                    {title}
                </div>
            }
            style={{
                top: currentPosition.y,
                left: currentPosition.x,
                position: 'absolute',
                ...modalProps.style
            }}
            wrapClassName={`custom-draggable-modal ${modalProps.wrapClassName || ''}`}
        >
            {children}
        </Modal>
    );
};
