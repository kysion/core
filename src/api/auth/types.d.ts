import { TokenType, UserInfoType } from "@kysion/types";

/**
 * 认证模块类型定义
 */

// 登录请求参数
export interface LoginParams {
    username: string;
    password: string;
    captcha?: string;
    captchaId?: string;
}

// 手机号登录请求参数
export interface LoginByMobileParams {
    mobile: string;
    captcha: string;
    captchaId: string;
}

// 邮箱登录请求参数
export interface LoginByMailParams {
    mail: string;
    captcha: string;
    captchaId: string;
}

// 刷新令牌请求参数
export interface RefreshTokenParams {
    refreshToken: string;
}

// 注册请求参数
export interface RegisterParams {
    username: string;
    password: string;
    confirmPassword: string;
    mobile?: string;
    mail?: string;
    inviteCode?: string;
}

// 手机号/邮箱注册请求参数
export interface RegisterByMobileOrMailParams {
    username: string;
    password: string;
    confirmPassword: string;
    mobileOrMail?: string;
    captcha: string;
    inviteCode?: string;
}

// 忘记密码请求参数
export interface ForgotPasswordParams {
    username: string;
    captcha: string;
    captchaId: string;
}

// 忘记用户名请求参数
export interface ForgotUserNameParams {
    mobileOrEmail?: string;
    captcha: string;
}

// 重置密码请求参数
export interface ResetPasswordParams {
    idKey: string;
    password: string;
    confirmPassword: string;
}

// 登录响应结果
export type LoginResult = TokenType & { user: UserInfoType }