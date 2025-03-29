import { Flex, Tooltip, Typography } from 'antd';
import type { TextProps } from 'antd/lib/typography/Text';
import classNames from 'classnames';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { type ReactNode, memo } from 'react';
import { validateDate } from '@kysion/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Common } from '../Common';

export type TypographyTextProps = TextProps & {
    text: React.Key | Dayjs | (() => ReactNode) | ReactNode | undefined | null;
    unknownText?: ReactNode;
    format?: string;
    tooltip?: string | true;
};

export const TypographyText = memo<TypographyTextProps>(
    ({ text, unknownText, tooltip, format, ...props }) => {
        const { t } = useTranslation();

        if (!text || text === '')
            return (
                <span className="truncate text-ellipsis c-gray">
                    {unknownText || `${t('kysion.common.state.unset')}`}
                </span>
            );

        const copyable = props.copyable;

        delete props.copyable;

        let linkStyle = '';

        if (props.onClick) linkStyle = 'cursor-pointer c-blue! hover:c-primary!';

        function makeAt() {
            if (
                (text && typeof text !== 'number' && typeof text !== 'string') ||
                (typeof text === 'string' && validateDate(text.toString()))
            ) {
                const dayjsText = dayjs(text?.toString());
                const newText = format ? dayjsText.format(format) : dayjsText.format('YYYY-MM-DD HH:mm:ss');
                return {
                    renderText: newText,
                    render: (
                        <Flex align="center" className="justify-center truncate">
                            <Typography.Text
                                {...props}
                                className={classNames('truncate text-ellipsis', linkStyle, props.className)}
                            >
                                {newText}
                            </Typography.Text>
                            {copyable && <Typography.Text copyable={copyable ?? { text: newText }} />}
                        </Flex>
                    ),
                };
            }
            return undefined;
        }

        function makeReactNode() {
            if (Common.isValidElement<ReactNode>(text)) {
                return {
                    render: (
                        <Flex align="center" className="justify-center truncate">
                            <Typography.Text
                                {...props}
                                className={classNames('truncate text-ellipsis', linkStyle, props.className)}
                            >
                                {text as any}
                            </Typography.Text>
                            {copyable && <Typography.Text copyable={copyable ?? ''} />}
                        </Flex>
                    ),
                };
            }
            return undefined;
        }

        function makeConstants() {
            const renderText = text?.toString() ?? '';
            if (
                text &&
                (typeof text === 'string' || typeof text === 'number' || typeof text === 'bigint')
            ) {
                return {
                    renderText,
                    render: (
                        <Flex align="center" className="justify-center truncate">
                            <Typography.Text
                                {...props}
                                className={classNames('truncate text-ellipsis', linkStyle, props.className)}
                            >
                                {renderText}
                            </Typography.Text>
                            {copyable && <Typography.Text copyable={copyable ?? { text: renderText }} />}
                        </Flex>
                    ),
                };
            }
            return undefined;
        }

        const data = makeAt() ?? makeReactNode() ?? makeConstants();

        if (typeof tooltip === 'string') {
            return <Tooltip title={tooltip}>{data?.render ?? text.toString() ?? ''}</Tooltip>;
        } else if (tooltip) {
            return (
                <Tooltip title={text.toString() ?? ''}>{data?.render ?? text.toString() ?? ''}</Tooltip>
            );
        }

        return <>{data?.render ?? text.toString() ?? ''}</>;
    },
);

TypographyText.displayName = 'Text';
