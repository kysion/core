import { CompanyType, EmployeeType, PermissionType, UserInfoType } from '@kysion/types';
import { createKyStore, createSelectors } from '../base';
import { Funs } from '@kysion/utils';
import { KysionApis } from '../../api';

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
    moduleConf: { moduleName: string, moduleType: number };
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
    moduleConf: { moduleName: '', moduleType: 0 },
};

export const useMyProfileStore = createKyStore<ProfileState>(initialState, {
    storageKey: 'myProfile',
    crypto: Funs.getEnv('APP_DEBUG_MODE', false, (v) => v === 'false')
});

export const useMyProfileState = createSelectors(useMyProfileStore);

export const useMyProfileActions = () => {
    const set = useMyProfileStore.setState;
    const get = useMyProfileStore.getState;

    return {
        login: async (user: UserInfoType, token: string, expireAt: string) => {
            set({ user, token, expireAt, isLoggedIn: true });
            await useMyProfileActions().reload();
        },
        reload: async () => {
            await KysionApis.Settings.getModuleConfInfo();

            await Promise.all([
                KysionApis.MyCompany.my.getCompany(),
                KysionApis.MyCompany.my.getProfile(),
                KysionApis.MyCompany.my.getTeams(),
                KysionApis.MyCompany.my.getMyCompanyPermissionList(),
            ]);
        },
        logout: () => set({ user: new UserInfoType(), token: null, expireAt: '', isLoggedIn: false }),
        setCompany: (company: CompanyType) => set({ company }),
        setEmployee: (employee: EmployeeType) => set({ employee }),
        setPermission: (permission: PermissionType) => set({ permission }),
        setUser: (user: UserInfoType) => set({ user }),
        setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
        setIsSuperAdmin: (isSuperAdmin: boolean) => set({ isSuperAdmin }),
        setModuleConf: (moduleConf: { moduleName: string, moduleType: number }) => set({ moduleConf }),
    };
};
