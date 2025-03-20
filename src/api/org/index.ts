import { Company, companyMap } from "../company";

export const Org = {
    HandCompany: companyMap['handCompany'] || new Company({ urlPrefix: 'handCompany' }),
    SubCompany: companyMap['subCompany'] || new Company({ urlPrefix: 'subCompany' }),
    Agent: companyMap['agent'] || new Company({ urlPrefix: 'agent' }),
}