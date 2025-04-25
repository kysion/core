import React from 'react';
import { useTranslation } from 'react-i18next';
import { Funs } from '@kysion/utils';
import { Typography } from 'antd';

interface BeianIcpNoProps {
    className?: string;
    style?: React.CSSProperties;
    textAlign?: 'left' | 'center' | 'right';
}

/**
 * 备案信息组件
 * 从环境变量中获取备案信息
 */
const BeianIcpNo: React.FC<BeianIcpNoProps> = ({
    className = '',
    style = {},
    textAlign = 'center'
}) => {
    const { i18n } = useTranslation();
    const ICP_NO = i18n.language === 'zh-CN' ? Funs.getEnv('APP_BEIAN_ICP_NO', '') : '';

    return (
        <div
            className={`${className}`}
            style={{
                textAlign,
                ...style
            }}
        >
            <Typography.Link href={`https://beian.miit.gov.cn/`} target="_blank" className="text-xs text-14px! font-normal">
                {ICP_NO}
            </Typography.Link>
        </div>
    );
};

export default BeianIcpNo; 