// 导出基础API
export * from './base';

// 导出所有API模块
export * from './modules';

// 导出KysionApis
import { Announcement } from './announcement';
import { Audit } from './audit';
import { Auth } from './auth';
import { Category } from './category';
import { Channel } from './channel';
import { Comment } from './comment';
import { Common } from './common';
import { Company, companyMap } from './company';
import { DeliveryCompany } from './delivery';
import { Iconify } from './iconify';
import { License } from './license';
import { Menu } from './menu';
import { Message } from './message';
import { MyProfile, MyCompany } from './my';
import { Org } from './org';
import { Permission } from './permission';
import { Role } from './role';
import { Settings } from './settings';
import { User } from './user';
import { Industry } from './industry';

/**
 * 导出兼容原项目的API集合
 */
export const KysionApis = {
    // 企业模块
    Member: companyMap['member'] || new Company({ urlPrefix: 'member' }),
    Merchant: companyMap['merchant'] || new Company({ urlPrefix: 'merchant' }),

    // 组织机构
    Org,

    // 资质模块
    License,

    // 其他模块
    Auth,
    Audit,
    Announcement,
    Category,
    Channel,
    Comment,
    Common,
    DeliveryCompany,
    Iconify,
    Industry,
    Menu,
    Message,
    MyProfile,
    MyCompany,
    Permission,
    Role,
    Settings,
    User
};