// 添加获取当前用户ID和公司ID的方法
export function getCurrentUserId(): string | null {
    try {
        console.log('获取当前用户ID...');

        // 尝试从URL参数获取
        const urlParams = new URLSearchParams(window.location.search);
        const userIdFromUrl = urlParams.get('userId');
        if (userIdFromUrl) {
            console.log('从URL参数获取到用户ID:', userIdFromUrl);
            return userIdFromUrl;
        }

        // 方法1: 尝试从本地存储获取用户信息
        const storageKeys = ['userInfo', 'user', 'userId', 'currentUser', 'auth', 'login'];
        for (const key of storageKeys) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    console.log(`尝试从localStorage[${key}]解析用户ID`);
                    const parsed = JSON.parse(data);
                    // 检查多种可能的字段
                    const possibleIdFields = ['id', 'userId', 'user_id', 'uid', 'ID'];
                    for (const field of possibleIdFields) {
                        if (parsed && parsed[field]) {
                            console.log(`从localStorage[${key}].${field}获取到用户ID:`, parsed[field]);
                            return parsed[field];
                        }
                    }

                    // 检查嵌套对象
                    const nestedObjects = ['user', 'userInfo', 'profile', 'account'];
                    for (const obj of nestedObjects) {
                        if (parsed && parsed[obj]) {
                            for (const field of possibleIdFields) {
                                if (parsed[obj][field]) {
                                    console.log(`从localStorage[${key}].${obj}.${field}获取到用户ID:`, parsed[obj][field]);
                                    return parsed[obj][field];
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`解析localStorage[${key}]失败:`, e);
                }
            }
        }

        // 方法2: 尝试从cookie获取用户信息
        const cookies = document.cookie.split(';');
        console.log('检查cookies中的用户ID，所有cookies:', cookies);

        const cookieKeys = ['userId', 'user_id', 'uid', 'token', 'auth'];
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (cookieKeys.includes(name) && value) {
                console.log(`从cookie[${name}]获取到用户ID:`, value);
                return value;
            }
        }

        // 方法3: 尝试从localStorage中的token解析
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (token) {
            try {
                // 尝试解析JWT
                const base64Url = token.split('.')[1];
                if (base64Url) {
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const tokenData = JSON.parse(jsonPayload);
                    if (tokenData.userId || tokenData.sub) {
                        const userId = tokenData.userId || tokenData.sub;
                        console.log('从JWT token中提取用户ID:', userId);
                        return userId;
                    }
                }
            } catch (e) {
                console.warn('解析JWT token失败:', e);
            }
        }

        // 方法4: 尝试从全局变量中获取
        if (window && (window as any).userId) {
            console.log('从全局变量window.userId获取用户ID:', (window as any).userId);
            return (window as any).userId;
        }

        if (window && (window as any).currentUser && (window as any).currentUser.id) {
            console.log('从全局变量window.currentUser获取用户ID:', (window as any).currentUser.id);
            return (window as any).currentUser.id;
        }

        // 如果上述方法都失败，尝试使用固定的测试用户ID
        console.warn('无法获取用户ID，使用默认测试ID: test_user_001');
        return 'test_user_001';
    } catch (e) {
        console.error('获取当前用户ID失败:', e);
        return 'error_fallback_user';
    }
}

export function getCurrentCompanyId(): string | null {
    try {
        console.log('获取当前公司ID...');

        // 尝试从URL参数获取
        const urlParams = new URLSearchParams(window.location.search);
        const companyIdFromUrl = urlParams.get('companyId') || urlParams.get('orgId') || urlParams.get('tenantId');
        if (companyIdFromUrl) {
            console.log('从URL参数获取到公司ID:', companyIdFromUrl);
            return companyIdFromUrl;
        }

        // 方法1: 尝试从本地存储获取公司信息
        const storageKeys = ['companyInfo', 'company', 'companyId', 'org', 'orgId', 'tenant', 'tenantId'];
        for (const key of storageKeys) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    console.log(`尝试从localStorage[${key}]解析公司ID`);
                    const parsed = JSON.parse(data);

                    // 检查多种可能的字段
                    const possibleIdFields = ['id', 'companyId', 'company_id', 'orgId', 'org_id', 'organizationId', 'tenantId'];
                    for (const field of possibleIdFields) {
                        if (parsed && parsed[field]) {
                            console.log(`从localStorage[${key}].${field}获取到公司ID:`, parsed[field]);
                            return parsed[field];
                        }
                    }

                    // 检查嵌套对象
                    const nestedObjects = ['company', 'companyInfo', 'org', 'organization', 'tenant'];
                    for (const obj of nestedObjects) {
                        if (parsed && parsed[obj]) {
                            for (const field of possibleIdFields) {
                                if (parsed[obj][field]) {
                                    console.log(`从localStorage[${key}].${obj}.${field}获取到公司ID:`, parsed[obj][field]);
                                    return parsed[obj][field];
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`解析localStorage[${key}]失败:`, e);
                }
            }
        }

        // 方法2: 尝试从cookie获取公司信息
        const cookies = document.cookie.split(';');
        console.log('检查cookies中的公司ID...', cookies.length);

        const cookieKeys = ['companyId', 'company_id', 'orgId', 'org_id', 'tenantId'];
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (cookieKeys.includes(name.trim()) && value) {
                console.log(`从cookie[${name}]获取到公司ID:`, value);
                return value;
            }
        }

        // 方法3: 尝试从localStorage中的token解析
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (token) {
            try {
                // 尝试解析JWT
                const base64Url = token.split('.')[1];
                if (base64Url) {
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));

                    const tokenData = JSON.parse(jsonPayload);
                    const companyIdFields = ['companyId', 'orgId', 'tenantId', 'organization', 'org'];
                    for (const field of companyIdFields) {
                        if (tokenData[field]) {
                            console.log(`从JWT token中提取公司ID[${field}]:`, tokenData[field]);
                            return tokenData[field];
                        }
                    }
                }
            } catch (e) {
                console.warn('解析JWT token失败:', e);
            }
        }

        // 方法4: 尝试从全局变量中获取
        if (window && (window as any).companyId) {
            console.log('从全局变量window.companyId获取公司ID:', (window as any).companyId);
            return (window as any).companyId;
        }

        if (window && (window as any).company && (window as any).company.id) {
            console.log('从全局变量window.company获取公司ID:', (window as any).company.id);
            return (window as any).company.id;
        }

        // 如果上述方法都失败，使用默认公司ID
        console.warn('无法获取公司ID，使用默认值: default_company_001');
        return 'default_company_001';
    } catch (e) {
        console.error('获取当前公司ID失败:', e);
        return 'error_fallback_company';
    }
} 