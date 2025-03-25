import { TokenType, CaptchaTypeEnum, UserInfoType, Records } from "@kysion/types";
import { ApiResponse, regexMatch } from "@kysion/utils";
import { http } from "../base";
import { ForgotPasswordParams, ForgotUserNameParams, LoginByMailParams, LoginByMobileParams, LoginParams, LoginResult, RefreshTokenParams, RegisterByMobileOrMailParams, ResetPasswordParams } from "./types";

export class Auth {
    // 用户登陆
    public static fetchLogin({
        account,
        username,
        password,
        captcha,
    }: {
        account: string;
        username?: string;
        password?: string;
        captcha: string;
    }) {
        let data = {};
        let url = '/auth/login';

        // 手机号登陆
        if (regexMatch.mobile.test(account)) {
            url = '/auth/loginByMobile';
            data = {
                mobile: account,
                username,
                password: password ?? '',
                captcha
            };
        }
        // 邮箱登陆
        else if (regexMatch.email.test(account)) {
            url = '/auth/loginByMail';
            data = {
                email: account,
                password: password ?? '',
                username,
                captcha
            };
        }
        // 账号登陆
        else {
            data = {
                username: account,
                password: password ?? '',
                captcha
            };
        }

        return http.post<TokenType & { user: UserInfoType }>(url, data, { skipErrorHandler: true });
    }
    /**
     * 用户登录
     * @param params 登录参数
     * @returns Promise
     */
    public static login(params: LoginParams) {
        return http.post<TokenType & { user: UserInfoType }>(`/auth/login`, params);
    }

    /**
     * 手机号登录
     * @param params 手机号登录参数
     * @returns Promise
     */
    public static loginByMobile(params: LoginByMobileParams) {
        return http.post<TokenType & { user: UserInfoType }>(`/auth/loginByMobile`, params);
    }
    /**
     * 邮箱登录
     * @param params 邮箱登录参数
     * @returns Promise
     */
    public static loginByMail(params: LoginByMailParams) {
        return http.post<TokenType & { user: UserInfoType }>(`/auth/loginByMail`, params);
    }

    /**
     * 刷新JWT令牌
     * @param params 刷新令牌参数
     * @returns Promise
     */
    public static refreshJwtToken(params: RefreshTokenParams) {
        return http.post<ApiResponse<LoginResult>>(`/auth/refreshJwtToken`, params);
    }
    /**
     * 发送短信验证码
     * @param captchaType 验证码类型
     * @param mobile 手机号码
     * @returns Promise
     */
    public static sendSmsCode({ captchaType, mobile }: { captchaType: CaptchaTypeEnum; mobile: string }) {
        return http.post<boolean>('/common/sendCaptchaBySms', { captchaType, mobile });
    }

    /**
     * 发送邮件验证码
     * @param captchaType 验证码类型
     * @param mail 邮箱地址
     * @returns Promise
     */
    public static sendEmailCode({ captchaType, mail }: { captchaType: CaptchaTypeEnum; mail: string }) {
        return http.post<boolean>('/common/sendCaptchaByMail', { captchaType, mail });
    }

    /**
     * 刷新token
     * @returns Promise
     */
    public static refreshAuthToken() {
        return http.post<TokenType>('/auth/refreshJwtToken');
    }

    /**
     * 忘记用户名
     * @param params 忘记用户名参数
     * @returns Promise
     */
    public static forgotUserName(params: ForgotUserNameParams) {
        return http.post<Records<UserInfoType>>('/auth/forgotUserName', params);
    }

    /**
     * 忘记密码
     * @param params 忘记密码参数
     * @returns Promise
     */
    public static forgotPassword(params: ForgotPasswordParams) {
        return http.post<ApiResponse<{ id: number }>>('/auth/forgotPassword', params);
    }

    /**
     * 重置密码
     * @param params 重置密码参数
     * @returns Promise
     */
    public static resetPassword(params: ResetPasswordParams) {
        return http.post<ApiResponse<boolean>>('/auth/resetPassword', params);
    }

    /**
     * 手机号/邮箱注册
     * @param params 手机号/邮箱注册参数
     * @returns Promise
     */
    public static registerByMobileOrMail(params: RegisterByMobileOrMailParams) {
        return http.post<ApiResponse<boolean>>('/auth/registerByMobileOrMail', params);
    }
}