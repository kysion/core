import { CaptchaTypeEnum, TokenType, UploadParams } from '@kysion/types';
import { http } from '..';
import { ApiResponse } from '@kysion/utils';

export class Common {
    // 发送短信验证码
    public static sendCaptchaBySms({ captchaType, mobile, scene }: { captchaType: CaptchaTypeEnum; mobile: string; scene: string }) {
        return http.post<{ captchaId: string }>('/common/sendCaptchaBySms', { captchaType, mobile, scene });
    }

    // 发送邮件验证码
    public static sendCaptchaByMail({ captchaType, mail, scene }: { captchaType: CaptchaTypeEnum; mail: string; scene: string }) {
        return http.post<{ captchaId: string }>('/common/sendCaptchaByMail', { captchaType, mail, scene });
    }

    // 获取验证码
    public static captcha() {
        return http.get<{ captchaId: string; captchaImg: string }>(`/common/captcha`);
    }

    /**
     * 上传文件
     * @param params 上传参数
     * @returns Promise
     */
    public static upload(params: UploadParams) {
        const formData = new FormData();
        formData.append('file', params.file);
        if (params.type) {
            formData.append('type', params.type);
        }
        return http.post<{ id: number | string; url: string }>(`/common/file/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            } as any,
        });
    }

    /**
     * 上传图片
     * @param params 上传参数
     * @returns Promise
     */
    public static uploadPicture(params: UploadParams) {
        const formData = new FormData();
        formData.append('file', params.file);
        if (params.type) {
            formData.append('type', params.type);
        }

        return http.post<{ id: number | string; url: string }>(`/common/file/uploadPicture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            } as any,
        });
    }

    /**
     * 根据ID获取文件
     * @param params 文件ID参数
     * @returns Promise
     */
    public static getFileById(params: { id: number | string, token: string }) {
        return http.get<{ id: number | string; url: string; name: string; size: number; type: string }>(`/common/file/getFileById`, params);
    }

    /**
     * 获取文件（直接URL访问）
     * @param id 文件ID
     * @returns 文件URL
     */
    public static getFileUrl(params: { id?: number | string, path?: string, cid?: number | string, styleStr?: string, token: string }) {
        return `/common/file/getFileById?id=${params.id}&path=${params.path ?? ''}&cid=${params.cid ?? ''}&styleStr=${params.styleStr ?? ''}&token=${params.token}`;
    }

    /**
     * 根据级别获取地区列表
     * @param params 级别参数
     * @returns Promise
     */
    public static getAreaListByLevel(params: { level: number }) {
        return http.post<any[]>(`/common/area/getAreaListByLevel`, params);
    }

    /**
     * 根据父级ID获取地区列表
     * @param params 父级ID参数
     * @returns Promise
     */
    public static getAreaListByParentId(params: { parentId: number | string }) {
        return http.post<any[]>(`/common/area/getAreaListByParentId`, params);
    }

    /**
     * 上传身份证并OCR识别
     * @param params 上传参数
     * @returns Promise
     */
    public static uploadIDCardWithOCR(params: UploadParams) {
        const formData = new FormData();
        formData.append('file', params.file);

        return http.post<any>(`/common/file/uploadIDCardWithOCR`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            } as any,
        });
    }

    /**
     * 上传银行卡并OCR识别
     * @param params 上传参数
     * @returns Promise
     */
    public static uploadBankCardWithOCR(params: UploadParams) {
        const formData = new FormData();
        formData.append('file', params.file);

        return http.post<any>(`/common/file/uploadBankCardWithOCR`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            } as any,
        });
    }

    /**
     * 上传营业执照并OCR识别
     * @param params 上传参数
     * @returns Promise
     */
    public static uploadBusinessLicenseWithOCR(params: UploadParams) {
        const formData = new FormData();
        formData.append('file', params.file);

        return http.post<any>(`/common/file/uploadBusinessLicenseWithOCR`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            } as any,
        });
    }
}