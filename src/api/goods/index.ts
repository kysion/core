import { GoodsSaleStateSet, GoodsInfoType } from "@kysion/types";
import { Query, Records } from "@kysion/types";
import { SpecificationType } from "@kysion/types";
import { http } from "../base";

export class Goods {
  /**
   * 申请商品审核
   * @param data 包含商品ID的对象
   */
  public static applyAudit(data: { id: React.Key }) {
    return http.post<boolean>('/goods/applyAudit', data);
  }

  /**
   * 取消商品审核
   * @param data 包含商品ID的对象
   */
  public static cancelAudit(data: { id: React.Key }) {
    return http.post<boolean>('/goods/cancelAudit', data);
  }

  /**
   * 创建商品
   * @param data 商品信息及规格数组
   */
  public static createGoods(data: GoodsInfoType & { speArr: SpecificationType[] }) {
    return http.post<GoodsInfoType>('/goods/createGoods', data);
  }

  /**
   * 删除商品
   * @param data 包含商品ID的对象
   */
  public static deleteGoods(data: { id: React.Key }) {
    return http.post<boolean>('/goods/deleteGoods', data);
  }

  /**
   * 根据ID获取商品详情
   * @param data 包含商品ID的对象
   */
  public static getGoodsById(data: { id: React.Key }) {
    return http.post<GoodsInfoType>('/goods/getGoodsById', data);
  }

  /**
   * 查询商品列表
   * @param params 查询参数
   */
  public static queryGoodsList(params: Query) {
    return http.post<Records<GoodsInfoType>>('/goods/queryGoods', params);
  }

  /**
   * 查询商品规格
   * @param data 包含商品ID的对象
   */
  public static queryGoodsSpecification(data: { id: React.Key }) {
    return http.post<SpecificationType[]>('/goods/queryGoodsSpecification', data);
  }

  /**
   * 设置商品审核状态
   * @param data 包含商品ID、是否通过审核及回复信息的对象
   */
  public static setAudit(data: { id: React.Key; isApprove: boolean; reply: string }) {
    return http.post<boolean>('/goods/setAudit', data);
  }

  /**
   * 设置商品规格
   * @param data 包含商品ID及规格数组的对象
   */
  public static setGoodsSpecification(data: { id: React.Key; speArr: SpecificationType[] }) {
    return http.post<SpecificationType[]>('/goods/setGoodsSpecification', data);
  }

  /**
   * 设置商品销售状态
   * @param data 包含商品ID及销售状态的对象
   */
  public static setState(data: { id: React.Key; saleState: GoodsSaleStateSet }) {
    return http.post<boolean>('/goods/setState', data);
  }

  /**
   * 更新商品信息
   * @param data 商品信息及规格数组
   */
  public static updateGoods(data: GoodsInfoType & { speArr: SpecificationType[] }) {
    return http.post<GoodsInfoType>('/goods/updateGoods', data);
  }

  /**
   * 设置商品服务费率
   * @param data 包含商品ID、是否自定义费率及服务费率的对象
   */
  public static setServiceRate(data: { id: React.Key; customRate: boolean; serviceRate: number }) {
    return http.post<boolean>('/goods/setServiceRate', data);
  }
}
