import { PermissionType } from "@kysion/types";
import { Company, http } from '..';

export class MyBase {

  private myCompany: Company;
  constructor(company: Company) {
    this.myCompany = company;
  }

  // 获取当前公司
  public Company = () => this.myCompany

  // 获取当前用户权限
  fetchMyPermission() {
    return http.post<PermissionType[]>('/my/getPermissions');
  }

  // 修改密码
  changePassword(params: { oldPassword: string; newPassword: string }) {
    return http.post<boolean>('/my/updateUserPassword', {
      oldPassword: params.oldPassword,
      password: params.newPassword,
      confirmPassword: params.newPassword
    });
  }

  // 修改业务手机号
  changeBusinessMobile(params: { mobile: string; captcha: string; password: string }) {
    return http.post<boolean>('/my/setMobile', params);
  }

  // 修改登录手机号
  changeLoginMobile(params: { mobile: string; captcha: string }) {
    return http.post<boolean>('/my/setUserMobile', params);
  }

  // 修改登录邮箱
  changeLoginEmail(params: { oldMail: string; newMail: string; captcha: string; password: string }) {
    return http.post<boolean>('/my/setUserMail', params);
  }

  // 修改用户名
  changeUsername(params: { newUsername: string }) {
    return http.post<boolean>('/my/setUserName', params);
  }

  // 心跳
  heartbeat() {
    return http.post<boolean>('/my/heartbeat', { skipErrorHandler: true });
  }
}

