
import { OrderInfoType, Query, Records } from "@kysion/types";
import { http } from "../base";

export class Orders {
  // 根据ID查询订单信息｜信息
  public static getOrdersById(data: { id: React.Key }) {
    return http.post<OrderInfoType>('/orders/getOrdersById', data);
  }

  // 订单查询｜列表
  public static queryOrdersList(params: Query) {
    return http.post<Records<OrderInfoType>>('/orders/queryOrdersList', params);
  }
}
