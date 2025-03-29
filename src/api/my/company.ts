import { useMyProfileStore } from "../../store";
import { Company } from "../company";
import { MyBase } from "./base";

class myCompany extends MyBase {
    private static instance: myCompany | null = null;

    private constructor() {
        const { moduleConf } = useMyProfileStore.getState();

        super(new Company({ urlPrefix: moduleConf.moduleName }));
    }

    public static getInstance(): myCompany {
        if (!myCompany.instance) {
            myCompany.instance = new myCompany();
        }
        return myCompany.instance;
    }
}

const MyCompany = myCompany.getInstance().Company();

export { MyCompany };