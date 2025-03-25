import { CompanyType, EmployeeType, PermissionType, UserInfoType } from '@kysion/types';
import { createKyStore, createSelectors } from '../base';
import { Funs } from '@kysion/utils';

export interface ProfileState {
    company: CompanyType;
    employee: EmployeeType;
    permission?: PermissionType;
    user: UserInfoType;
    isAdmin: boolean;
    isSuperAdmin: boolean;

    token: string | null;
    expireAt: string;
    isLoggedIn: boolean;
}

const initialState: ProfileState = {
    user: new UserInfoType(),
    company: new CompanyType(),
    employee: new EmployeeType(),
    isAdmin: false,
    isSuperAdmin: false,
    token: null,
    expireAt: '',
    isLoggedIn: false,
}

export const useUserStore = createKyStore<ProfileState>(initialState, {
    storageKey: 'myProfile',
    crypto: Funs.getEnv('APP_DEBUG_MODE', false)
});

export const useUserState = createSelectors(useUserStore);

export const useUserActions = () => {
    const set = useUserStore.setState;
    const get = useUserStore.getState;

    return {
        login: (user: UserInfoType, token: string, expireAt: string) => set({ user, token, expireAt, isLoggedIn: true }),
        logout: () => set({ user: new UserInfoType(), token: null, expireAt: '', isLoggedIn: false }),
        setCompany: (company: CompanyType) => set({ company }),
        setEmployee: (employee: EmployeeType) => set({ employee }),
        setPermission: (permission: PermissionType) => set({ permission }),
        setUser: (user: UserInfoType) => set({ user }),
        setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
        setIsSuperAdmin: (isSuperAdmin: boolean) => set({ isSuperAdmin }),
    };
};
