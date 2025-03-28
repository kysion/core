import React from 'react';
import type { DescriptionsProps } from 'antd';
import { Avatar, Card, Descriptions, Flex, Skeleton, Space, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { EmployeeType, UserInfoType, userStatusSet, UserStatusTypeArr } from '@kysion/types';
import { useTranslation } from 'react-i18next';

export interface AuthRef {
  setAvatar?: () => void;
  refresh?: () => void;
}

export interface CardInfoProps {
  userId: React.Key;
  employee?: EmployeeType | undefined;
  userinfo?: UserInfoType;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  onSetAvatar?: () => void;
  allowEdit?: boolean;
  column?: 1 | 2 | 3 | 4 | undefined;
  autoReload?: boolean;
}

export const EmployeeInfoCard = forwardRef<AuthRef, CardInfoProps>((props, ref) => {
  if (!props.userinfo && props.employee && props.employee.user) {
    props.userinfo = props.employee.user;
  }

  if(props.column === undefined) {
    props.column = 3;
  }

  const { t } = useTranslation();

  const [employee, _setEmployee] = useState<EmployeeType | undefined>(
    props.employee ?? new EmployeeType(),
  );
  const [userinfo, _setUserinfo] = useState<UserInfoType | undefined>(props.userinfo);
  const [loading, _setLoading] = useState(!props.userinfo && !props.employee);

  let sex = <Skeleton.Input size="small" active={loading} />;
  let mobile = <Skeleton.Input size="small" active={loading} />;
  let realname = <Skeleton.Input size="small" active={loading} />;
  let hiredAt = <Skeleton.Input size="small" active={loading} />;

  const unsetLabel = t('kysion.common.state.unset');

  function makeEmployee() {
    if (employee) {
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

  function makeDescriptionsItem() {
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
      children: hiredAt.toString(),
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

    function makeItems() {
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

    return makeItems();
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

  console.log('makeDescriptionsItem', makeDescriptionsItem());

  return (
    <Card className="h-170px w-full flex justify-start bg-container">
      <Flex gap={24}>
        {makeAvatar()}
        <Descriptions
          size="small"
          column={props.column}
          items={makeDescriptionsItem()}
        ></Descriptions>
      </Flex>
    </Card>
  );
});
