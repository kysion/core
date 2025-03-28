import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// 导出所有API模块
export * from './api';
export * from './store';
export { useNotifyStore, useNotifyState, useNotifyActions } from './store/notify';

export interface ApiConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
}

export class ApiClient {
    private instance: AxiosInstance;

    constructor(config: ApiConfig = {}) {
        this.instance = axios.create({
            baseURL: config.baseURL || '/api',
            timeout: config.timeout || 10000,
            headers: {
                'Content-Type': 'application/json',
                ...config.headers,
            },
        });

        // 请求拦截器
        this.instance.interceptors.request.use(
            (config) => {
                // 在这里可以添加token等认证信息
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response) => {
                return response.data;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    // 基本请求方法
    async get<T = any>(url: string, config?: AxiosRequestConfig) {
        return this.instance.get<T>(url, config);
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.instance.post<T>(url, data, config);
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
        return this.instance.put<T>(url, data, config);
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig) {
        return this.instance.delete<T>(url, config);
    }
}

// 导出默认实例
export const api = new ApiClient();

// 导出类型
export type { AxiosRequestConfig, AxiosInstance }; 