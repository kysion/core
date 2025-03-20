import { http } from "../base";
import { CategoryType, Query, Records } from "@kysion/types";

export class Category {
  public static fetchCategoryList(query: Query) {
    return http.post<Records<CategoryType>>('/category/queryCategory', query);
  }

  public static createCategory(data: CategoryType) {
    return http.post<CategoryType>('/category/createCategory', data);
  }

  public static updateCategory(data: CategoryType) {
    return http.post<CategoryType>('/category/updateCategory', data);
  }

  public static deleteCategory(data: { id: string | number }) {
    return http.post<boolean>('/category/deleteCategory', data);
  }

  public static getCategoryById(data: { id: string | number }) {
    return http.post<CategoryType>('/category/getCategoryById', data);
  }
}
