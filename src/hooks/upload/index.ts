import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { KysionApis } from "../../api";
import { UploadProps } from "./types";

export const useKyUpload = (props?: UploadProps) => {
    const { t } = useTranslation();
    const uploadFile = useCallback(async (options: any) => {
        const { file, onSuccess, onError } = options;

        props?.setUploading?.(true);

        KysionApis.Common.upload({ file: file }).then((result) => {
            const response = result as { id: number };
            if (response) {
                onSuccess(response);
                window.$message?.success(t('kysion.common.message.uploadSuccess'));
            } else {
                onError();
                window.$message?.error(t('kysion.common.message.uploadFailed'));
            }
        }).catch(error => {
            console.error('上传失败:', error);
            onError();
            window.$message?.error(t('kysion.common.message.uploadFailed'));
        }).finally(() => {
            props?.setUploading?.(false);
        });
    }, []);

    return {
        uploadFile
    };
}