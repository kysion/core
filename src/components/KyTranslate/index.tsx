import { FC, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import React from 'react';

export interface KyTranslateProps {
    /**
     * 语言包中的 key
     */
    localeKey: string;
    /**
     * 提示信息，如果提供则会显示在 Tooltip 中
     */
    tip?: string;
}

/**
 * 翻译组件
 * @param props.localeKey - 语言包中的 key
 * @param props.tip - 提示信息，如果提供则会显示在 Tooltip 中
 */
const KyTranslate: FC<KyTranslateProps> = memo(({ localeKey, tip }) => {
    const { t } = useTranslation();
    const [translatedText, setTranslatedText] = useState(t(localeKey));

    useEffect(() => {
        // 监听语言变化
        const handleLanguageChanged = () => {
            setTranslatedText(t(localeKey));
        };

        i18next.on('languageChanged', handleLanguageChanged);

        return () => {
            i18next.off('languageChanged', handleLanguageChanged);
        };
    }, [localeKey, t]);

    return <span data-tip={tip}>{translatedText}</span>;
});

KyTranslate.displayName = 'KyTranslate';

export { KyTranslate }; 