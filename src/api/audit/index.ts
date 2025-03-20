import { http } from "../base";
import { AuditType, Query, Records } from "@kysion/types";

export class Audit {
  public static setAuditApprove(data: { auditId: string | number }) {
    return http.post<boolean>('/audit/setAuditApprove', {
      id: data.auditId
    });
  }

  public static setAuditReject(data: { auditId: string | number; reply: string }) {
    return http.post<boolean>('/audit/setAuditReject', {
      id: data.auditId,
      reply: data.reply
    });
  }

  public static queryAuditList(query: Query) {
    return http.post<Records<AuditType>>('/person_audit/queryAuditList', query);
  }

  public static getAuditById(data: { id: string | number }) {
    return http.post<AuditType>('/person_audit/getAuditById', data);
  }
}
