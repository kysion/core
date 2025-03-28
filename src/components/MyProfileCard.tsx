import React from 'react';
import type { DescriptionsProps } from 'antd';
import { Avatar, Card, Descriptions, Divider, Flex, Skeleton, Space, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { AuthStateMap, authStateSet, CompanyType, EmployeeType, EnabledStateMap, enabledStateSet, UserInfoType, UserStatusTypeArr } from '@kysion/types';
import { useTranslation } from 'react-i18next';

export interface AuthRef {
  setAvatar?: () => void;
  refresh?: () => void;
}

export interface CardInfoProps {
  userId: React.Key;
  company?: CompanyType;
  employee?: EmployeeType | undefined;
  userinfo?: UserInfoType;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  onSetAvatar?: () => void;
  allowEdit?: boolean;
  column?: 1 | 2 | 3 | 4 | undefined;
  autoReload?: boolean;
}

export const MyProfileCard = forwardRef<AuthRef, CardInfoProps>((props, ref) => {
  if (!props.userinfo && props.employee && props.employee.user) {
    props.userinfo = props.employee.user;
  }

  if(props.column === undefined) {
    props.column = 3;
  }

  const { t } = useTranslation();

  const [company, _setCompany] = useState<CompanyType | undefined>(props.company ?? new CompanyType());
  const [employee, _setEmployee] = useState<EmployeeType | undefined>(
    props.employee ?? new EmployeeType(),
  );
  const [userinfo, _setUserinfo] = useState<UserInfoType | undefined>(props.userinfo);
  const [loading, _setLoading] = useState(!props.userinfo && !props.employee);

  const unsetLabel = t('kysion.common.state.unset');

  let companyName = <Skeleton.Input size="small" active={loading} />;
  let companyAddr = <Skeleton.Input size="small" active={loading} />;
  let companyState = <Skeleton.Input size="small" active={loading} />;
  let companyLicenseState = <Skeleton.Input size="small" active={loading} />;
  let companyContactName = <Skeleton.Input size="small" active={loading} />;
  let companyContactMobile = <Skeleton.Input size="small" active={loading} />;

  function makeCompany() {
    if (!company) return;

    companyName = <>{company.name}</>;
    if (company.name === '') {
      companyName = <span className="text-gray-300">{unsetLabel}</span>;
    }
    companyAddr = <>{company.address || unsetLabel}</>;
    if (company.address === '') {
      companyAddr = <span className="text-gray-300">{unsetLabel}</span>;
    }
    companyState = <><Tag color="default">{t(EnabledStateMap.get(enabledStateSet.Enabled)!.i18nLabel)}</Tag></>;
    if (company.state === 1) {
      companyState = <><Tag color="success">{t(EnabledStateMap.get(enabledStateSet.Enabled)!.i18nLabel)}</Tag></>;
    }
    companyLicenseState = <><Tag color="default">{t(AuthStateMap.get(authStateSet.Invalid)!.i18nLabel)}</Tag></>;
    if (company.licenseState === authStateSet.Normal) {
      companyLicenseState = <><Tag color="success">{t(AuthStateMap.get(authStateSet.Normal)!.i18nLabel)}</Tag></>;
    }
    if(company.licenseId === 0) {
      companyLicenseState = <><Tag color="volcano">{t(AuthStateMap.get(authStateSet.UnVerified)!.i18nLabel)}</Tag></>;
    }
    companyContactName = <>{company.contactName || unsetLabel}</>;
    if (company.contactName === '') {
      companyContactName = <span className="text-gray-300">{unsetLabel}</span>;
    }
    companyContactMobile = <>{company.contactMobile || unsetLabel}</>;
    if (company.contactMobile === '') {
      companyContactMobile = <span className="text-gray-300">{unsetLabel}</span>;
    }
  };
  makeCompany();
  
  let sex = <Skeleton.Input size="small" active={loading} />;
  let mobile = <Skeleton.Input size="small" active={loading} />;
  let realname = <Skeleton.Input size="small" active={loading} />;
  let hiredAt = <Skeleton.Input size="small" active={loading} />;


  function makeEmployee() {
    if (!employee) return;
  
    sex = employee.sex === 1 ? <>男</> : <>女</>;
    if (employee.sex === 2 || !props.employee) {
      sex = <span className="text-gray-300">{unsetLabel}</span>;
    }

    mobile = <>{employee.mobile}</>;
    if (employee.mobile === '' || !employee.mobile) {
      mobile = <span className="text-gray-300">{unsetLabel}</span>;
    }

    realname = <>{employee.name}</>;
    if (employee.name === '') {
      realname = <span className="text-gray-300">{unsetLabel}</span>;
    }

    hiredAt = <span className="text-gray-300">{unsetLabel}</span>;
    if (employee.hiredAt !== '') {
      hiredAt = <>{dayjs(employee.hiredAt).format('YYYY-MM-DD')}</>;
    }
  }
  makeEmployee();

  function makeEmail() {
    let email = <Skeleton.Input size="small" active={loading} />;
    if (userinfo) {
      email = <span className="text-gray-300">{unsetLabel}</span>;
      if (userinfo.email !== '') {
        email = <>{userinfo.email}</>;
      }
    }
    return email;
  }

  function makeRoleNames() {
    let roleNames = [];
    roleNames.push(<Skeleton.Input size="small" active={loading} />);
    if (userinfo) {
      roleNames = [];
      if (props.isSuperAdmin) {
        roleNames.push(
          <Tag color="volcano">{t('kysion.user.type.SuperAdmin')}</Tag>,
        );
      } else if (props.isAdmin) {
        roleNames.push(
          <Tag color="orange">{t('kysion.user.type.Admin')}</Tag>,
        );
      } else if (userinfo.roleNames.length > 0) {
        userinfo.roleNames.forEach((item) => {
          roleNames.push(<Tag color="processing">{item}</Tag>);
        });
      }
    }
    return roleNames;
  }

  let lastLoginAt = <Skeleton.Input size="small" active={loading} />;
  let lastLoginArea = <Skeleton.Input size="small" active={loading} />;
  let state = <Skeleton.Input size="small" active={loading} />;
  let username = <Skeleton.Input size="small" active={loading} />;

  function makeUserInfo() {
    if (userinfo) {
      lastLoginAt = (
        <span className="text-gray-300">
          {t('kysion.common.state.notLogin')}
        </span>
      );
      if (userinfo.detail?.lastLoginAt) {
        lastLoginAt = <>{userinfo.detail?.lastLoginAt.toString()}</>;
      }
      lastLoginArea = (
        <span className="text-gray-300">
          {t('kysion.common.state.notLogin')}
        </span>
      );
      if (userinfo.detail?.lastLoginArea) {
        lastLoginArea = <>{userinfo.detail?.lastLoginArea}</>;
      }
      state = <></>;

      const userState = UserStatusTypeArr.find((item) => item.state === userinfo.state);

      if (userState) {
        state = (
          <Tag color={userState.color}>{t(userState.i18nLabel)}</Tag>
        );
      }

      username = <>{userinfo.username}</>;
    }
  }
  makeUserInfo();

  const emptyItem = {
    label: '',
    children: '',
  };

  function makeCompanyDescriptionsItem() {
    const companyNameItem = {
      label: t('kysion.company.column.name'),
      children: companyName,
    };
    const companyAddrItem = {
      label: t('kysion.company.column.addr'),
      children: companyAddr,
    };
    const companyStateItem = {
      label: t('kysion.company.column.state'),
      children: companyState,
    };
    const companyLicenseStateItem = {
      label: t('kysion.company.column.licenseState'),
      children: companyLicenseState,
    };
    const companyContactNameItem = {
      label: t('kysion.company.column.contactName'),
      children: companyContactName,
    };
    const companyContactMobileItem = {
      label: t('kysion.company.column.contactMobile'),
      children: companyContactMobile,
    };

    function makeResultItems() {
      let items: DescriptionsProps['items'] = [];
      if (props.column === 4) {
        items = [
          companyNameItem,
          companyContactNameItem,
          companyContactMobileItem,
          emptyItem,
          companyStateItem,
          companyLicenseStateItem,
          emptyItem,
          companyAddrItem,
        ];
      } else if (props.column === 1) {
        items = [
          companyNameItem,
          companyContactNameItem,
          companyContactMobileItem,
          companyStateItem,
          companyLicenseStateItem,
          companyAddrItem,
        ];
      } else if (props.column === 2) {
        items = [
          companyNameItem,
          emptyItem,
          companyStateItem,
          companyLicenseStateItem,
          companyContactNameItem,
          companyContactMobileItem,
          companyAddrItem,
        ];
      } else if (props.column === 3) {
        items = [
          companyNameItem,
          companyStateItem,
          companyLicenseStateItem,
          companyContactNameItem,
          companyContactMobileItem,
          emptyItem,
          companyAddrItem,
        ];
      }
      return items;
    }
    return makeResultItems();
  }

  function makeProfileDescriptionsItem() {
    const realnameItem = {
      label: t('kysion.user.column.name'),
      children: realname,
    };
    const sexItem = {
      label: t('kysion.user.column.sex'),
      children: sex,
    };
    const mobileItem = {
      label: t('kysion.user.column.mobile'),
      children: mobile,
    };
    const stateItem = {
      label: t('kysion.user.column.state'),
      children: state,
    };
    const hiredAtItem = {
      label: t('kysion.user.column.hiredAt'),
      children: hiredAt,
    };
    const lastLoginAtItem = {
      label: t('kysion.user.column.lastLoginAt'),
      children: lastLoginAt,
    };
    const emailItem = {
      label: t('kysion.user.column.email'),
      children: makeEmail(),
    };
    const usernameItem = {
      label: t('kysion.user.column.username'),
      children: username,
    };
    const roleNamesItem = {
      label: t('kysion.user.column.role'),
      children: (
        <Space>
          {makeRoleNames().map((item, index) => {
            return <span key={index}>{item}</span>;
          })}
        </Space>
      ),
    };
    // const auditStateItem = {
    //   label: '实名认证',
    //   children:
    //     ((employee? as number) ?? 0) > 0 ? (
    //       <Tag color="success">已实名</Tag>
    //     ) : (
    //       <Tag bordered={false} color="default">
    //         未实名
    //       </Tag>
    //     ),
    // };
    const lastLoginIpItem = {
      label: t('kysion.user.column.lastLoginArea'),
      children: lastLoginArea,
    };

    function makeResultItems() {
      let items: DescriptionsProps['items'] = [];

      if (props.column === 4) {
        items = [
          usernameItem,
          realnameItem,
          // auditStateItem,
          lastLoginIpItem,
          mobileItem,
          sexItem,
          roleNamesItem,
          lastLoginAtItem,
          emailItem,
          hiredAtItem,
          stateItem,
        ];
      } else if (props.column === 1) {
        items = [
          usernameItem,
          realnameItem,
          sexItem,
          mobileItem,
          emailItem,
          // auditStateItem,
          roleNamesItem,
          stateItem,
          hiredAtItem,
          lastLoginAtItem,
          lastLoginIpItem,
        ];
      } else if (props.column === 2) {
        items = [
          usernameItem,
          realnameItem,
          mobileItem,
          sexItem,
          emailItem,
          // auditStateItem,
          roleNamesItem,
          stateItem,
          lastLoginAtItem,
          hiredAtItem,
          lastLoginIpItem,
        ];
      } else if (props.column === 3) {
        items = [
          usernameItem,
          realnameItem,
          hiredAtItem,
          mobileItem,
          sexItem,
          lastLoginAtItem,
          emailItem,
          stateItem,
          lastLoginIpItem,
          roleNamesItem,
          // auditStateItem,
        ];
      }
      return items;
    }

    return makeResultItems();
  }

  function refresh() {
    // Promise.all([getEmployeeInfo(), getAuditInfo()]).then(() => {
    //   setLoading(false);
    // });
  }

  function setAvatar() {
    if (props.onSetAvatar) props.onSetAvatar();
  }

  useImperativeHandle(ref, () => ({
    setAvatar,
    refresh,
  }));

  useEffect(() => {
    if (props.autoReload === true) refresh();
  }, [props.autoReload]);

  function makeAvatar() {
    if (props.employee === undefined && props.userinfo === undefined)
      return (
        <Flex className="relative m-l-16px">
          <Skeleton.Avatar active={loading} size={96} />
        </Flex>
      );

    return (
      <Flex className="relative m-l-16px" gap={8}>
        <Avatar
          size={{ xs: 96, sm: 96, md: 96, lg: 96, xl: 96, xxl: 96 }}
          // src={props.employee!.avatar}
          icon={<UserOutlined />}
        ></Avatar>
        {props.allowEdit === true && (
          <Avatar
            className="absolute bottom--0 right--0 size-32px bg-gray-300 text-primary"
            onClick={setAvatar}
          >
            <Icon fontSize={20} icon="fluent:camera-28-regular" />
          </Avatar>
        )}
      </Flex>
    );
  }

  return (
    <Card className="h-auto w-full flex justify-start bg-container">
      <Flex className="w-full" gap={24}>
        {makeAvatar()}
        <Descriptions
          size="small"
          column={props.column}
          items={makeProfileDescriptionsItem()}
        ></Descriptions>
      </Flex>
      { props.userinfo && props.company && <Divider /> }
      {props.company && <>
        <Flex className="w-full" gap={24}>
          <Descriptions
            size="small"
            column={props.column}
            items={makeCompanyDescriptionsItem()}
          ></Descriptions>
        </Flex>
      </>}
    </Card>
  );
});
