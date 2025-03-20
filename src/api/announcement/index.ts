import type { AnnouncementStateSet, AnnouncementType, Query, Records } from "@kysion/types";
import { http } from '../base';

export class Announcement {
  /**
   * 添加公告｜信息
   */
  public static createAnnouncement(data: {
    title: string;
    publicAt: string;
    body: string;
    userTypeScope: number;
    expireAt: string;
    extDataJson: string;
    state: AnnouncementStateSet;
  }) {
    return http.post<AnnouncementType>('/announcement/createAnnouncement', data);
  }

  /**
   * 删除公告
   */
  public static deleteAnnouncement(data: { id: string | number }) {
    return http.post<{ data: AnnouncementType }>('/announcement/deleteAnnouncement', data);
  }

  /**
   * 根据id查询公告｜信息
   */
  public static getAnnouncementById(data: { id: string | number }) {
    return http.post<AnnouncementType>('/announcement/getAnnouncementById', data);
  }

  /**
   * 查询公告｜列表
   */
  public static queryAnnouncement(query: Query) {
    return http.post<Records<AnnouncementType>>('/announcement/queryAnnouncement', query);
  }

  /**
   * 编辑公告｜信息
   */
  public static updateAnnouncement(data: Partial<AnnouncementType> & { id: string | number }) {
    return http.post<AnnouncementType>('/announcement/updateAnnouncement', data);
  }

  /**
   * 获取未读公告数量
   */
  public static hasUnReadAnnouncement() {
    return http.post<number>('/announcement/hasUnReadAnnouncement');
  }

  /**
   * 标记未读｜公告
   */
  public static markUnRead(data: { id: string | number }) {
    return http.post<boolean>('/announcement/markUnRead', data);
  }

  /**
   * 标记已读｜公告
   */
  public static markRead(data: { id: string | number }) {
    return http.post<boolean>('/announcement/markRead', data, {
      skipErrorHandler: true
    });
  }

  /**
   * 查询用户的公告｜列表
   */
  public static queryAnnouncementListByUser(params: Query) {
    let readState = 2;
    params.filter.find((item: { field: string; value: any }) => {
      if (item.field === 'readState') {
        readState = item.value;
        return true;
      }
      return false;
    });

    params.filter = params.filter.filter((item: { field: string }) => item.field !== 'readState');
    params.orderBy = params.orderBy.filter((item: { field: string }) => item.field !== 'readState');

    if (params.pageNum <= 0) {
      params.pageNum = 1;
    }

    return http.post<Records<AnnouncementType>>('/announcement/queryAnnouncementListByUser', {
      ...params,
      type: readState,
    });
  }
}
