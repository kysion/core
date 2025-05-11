import { Company, companyMap } from "../company";

export const Org = {
    HeadCompany: companyMap['headCompany'] || new Company({ urlPrefix: 'headCompany' }),
    SubCompany: companyMap['subCompany'] || new Company({ urlPrefix: 'subCompany' }),
    Agent: companyMap['agent'] || new Company({ urlPrefix: 'agent' }),
    MemberCustomer: companyMap['member'] || new Company({ urlPrefix: 'member' }),
}