import type { IconifyInfo, IconifyJSON } from '@iconify/types';
import { http } from '../base';

export type APIv2CollectionsList = Record<string, IconifyInfo>;

export interface APIv2CollectionResponse {
  // Icon set prefix
  prefix: string;

  // Number of icons (duplicate of info?.total)
  total: number;

  // Icon set title, if available (duplicate of info?.name)
  title?: string;

  // Icon set info
  info?: IconifyInfo;

  // List of icons without categories
  uncategorized?: string[];

  // List of icons, sorted by category
  categories?: Record<string, string[]>;

  // List of hidden icons
  hidden?: string[];

  // List of aliases, key = alias, value = parent icon
  aliases?: Record<string, string>;

  // Characters, key = character, value = icon name
  chars?: Record<string, string>;

  // Themes
  themes?: IconifyJSON['themes'];
  prefixes?: IconifyJSON['prefixes'];
  suffixes?: IconifyJSON['suffixes'];
}

export interface APIv2SearchResponse {
  // List of icons, including prefixes
  icons: string[];

  // Number of results. If same as `limit`, more results are available
  total: number;

  // Number of results shown
  limit: number;

  // Index of first result
  start: number;

  // Info about icon sets
  collections: Record<string, IconifyInfo>;
}

export class Iconify {
  /**
   * 查询图标集合列表
   * @param prefixes 图标集合前缀列表
   * @returns 图标集合信息列表
   */
  public static queryCollections(prefixes?: string[]) {
    return http.post<APIv2CollectionsList>('/iconify/collections', { prefixes });
  }

  /**
   * 查询指定前缀的图标集合
   * @param prefix 图标集合前缀
   * @returns 图标集合详情
   */
  public static queryIcons(prefix: string) {
    return http.post<APIv2CollectionResponse>('/iconify/getIcons', { prefix });
  }

  /**
   * 搜索图标
   * @param keyword 搜索关键词
   * @returns 搜索结果
   */
  public static searchIcons(keyword: string) {
    return http.post<APIv2SearchResponse>('/iconify/search', { keyword });
  }
}
