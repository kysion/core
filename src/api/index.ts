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
import { Delivery } from './delivery';
import { Finance } from './finance';
import { Goods } from './goods';
import { Iconify } from './iconify';
import { Industry } from './industry';
import { License } from './license';
import { Menu } from './menu';
import { Message } from './message';
import { MyCompany, MyProfile } from './my';
import { Org } from './org';
import { Permission } from './permission';
import { Role } from './role';
import { Settings } from './settings';
import { User } from './user';
import { Orders } from './orders';
import { System } from './system';
/**
 * 导出兼容原项目的API集合
 */
export const KysionApis = {
    // 企业模块
    MemberCustomer: companyMap['member'] || new Company({ urlPrefix: 'member' }),
    Merchant: companyMap['merchant'] || new Company({ urlPrefix: 'merchant' }),
    Agent: companyMap['agent'] || new Company({ urlPrefix: 'agent' }),
    HeadCompany: companyMap['headCompany'] || new Company({ urlPrefix: 'headCompany' }),
    SubCompany: companyMap['subCompany'] || new Company({ urlPrefix: 'subCompany' }),

    // 组织机构
    Org,

    // 资质模块
    License,

    // 其他模块
    Announcement,
    Audit,
    Auth,
    Category,
    Channel,
    Comment,
    Common,
    Delivery,
    Finance,
    Goods,
    Iconify,
    Industry,
    Menu,
    Message,
    MyCompany,
    MyProfile,
    Orders,
    Permission,
    Role,
    Settings,
    System,
    User
};