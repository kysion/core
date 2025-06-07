import { InviteCodeType } from "@kysion/types";
import { http } from "../base";

export class Invite {
    public static myCustomerInvite() {
        return http.post<InviteCodeType>('/my/myCustomerInvite', {});
    }
}