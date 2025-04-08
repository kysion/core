import { CompanyInfoType, EmployeeType, PermissionType, UserInfoType, UserTypeSet } from '@kysion/types';
import { createKyStore, createSelectors } from '@kysion/utils';
import { Funs } from '@kysion/utils';
import { StoreApi, UseBoundStore } from 'zustand';
import { useTableActions } from './tableStore';
import { KysionApis } from '../../api';

export interface ProfileState {
    company: CompanyInfoType;
    employee: EmployeeType;
    permission?: PermissionType;
    user: UserInfoType;
    isAdmin: boolean;
    isSuperAdmin: boolean;

    token: string | null;
    expireAt: string;
    isLoggedIn: boolean;
    moduleConf: { moduleName: string, moduleType: number };
}

const initialState: ProfileState = {
    user: new UserInfoType(),
    company: new CompanyInfoType(),
    employee: new EmployeeType(),
    isAdmin: false,
    isSuperAdmin: false,
    token: null,
    expireAt: '',
    isLoggedIn: false,
    moduleConf: { moduleName: '', moduleType: 0 },
};

export const useMyProfileStore: UseBoundStore<StoreApi<ProfileState>> = createKyStore<ProfileState>(initialState, {
    storageKey: 'myProfile',
    crypto: Funs.getEnv('APP_DEBUG_MODE', false, (v) => v === 'false')
}, { name: 'my/profile' });

export const useMyProfileState = createSelectors(useMyProfileStore);

export const useMyProfileActions = () => {
    const set = useMyProfileStore.setState;
    const get = useMyProfileStore.getState;

    return {
        login: (user: UserInfoType, token: string, expireAt: string) => {
            set({ user, token, expireAt, isLoggedIn: true });
        },
        refresh: async () => {
            await Promise.all([
                useTableActions().refresh(),
                KysionApis.MyCompany.my.setUrlPrefix(get().moduleConf.moduleName),
                KysionApis.MyCompany.my.getCompany(),
                KysionApis.MyCompany.my.getProfile(),
                KysionApis.MyCompany.my.getTeams(),
                KysionApis.MyCompany.my.getMyCompanyPermissionList(),
            ])
        },
        hasPermission: ({ identifier, allowUserTypeArr }: { identifier: string, allowUserTypeArr?: UserTypeSet[] }) => {
            return true;
        },
        logout: () => set({ user: new UserInfoType(), token: null, expireAt: '', isLoggedIn: false }),
        setCompany: (company: CompanyInfoType) => set({ company }),
        setEmployee: (employee: EmployeeType) => set({ employee }),
        setPermission: (permission: PermissionType) => set({ permission }),
        setUser: (user: UserInfoType) => set({ user }),
        setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
        setIsSuperAdmin: (isSuperAdmin: boolean) => set({ isSuperAdmin }),
        setModuleConf: (moduleConf: { moduleName: string, moduleType: number }) => set({ moduleConf }),
    };
};
