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
    isLogined: boolean;
}

const initialState: ProfileState = {
    user: new UserInfoType(),
    company: new CompanyType(),
    employee: new EmployeeType(),
    isAdmin: false,
    isSuperAdmin: false,
    isLogined: false,
}

const IsDebug = Funs.getEnv('APP_DEBUG_MODE', 'false')?.toString() === 'false' || false;

export const useUserStore = createKyStore<ProfileState>(initialState, {
    storageKey: 'myProfile',
    crypto: IsDebug ? undefined : true
});

export const useUserState = createSelectors(useUserStore);

export const useUserActions = () => {
    const set = useUserStore.setState;
    const get = useUserStore.getState;

    return {
        login: (user: UserInfoType) => set({ user, isLogined: true }),
        logout: () => set({ user: new UserInfoType(), isLogined: false }),
        setCompany: (company: CompanyType) => set({ company }),
        setEmployee: (employee: EmployeeType) => set({ employee }),
        setPermission: (permission: PermissionType) => set({ permission }),
        setUser: (user: UserInfoType) => set({ user }),
        setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
        setIsSuperAdmin: (isSuperAdmin: boolean) => set({ isSuperAdmin }),
    };
};
