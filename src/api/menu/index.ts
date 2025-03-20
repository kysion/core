import { http } from "../base";
import { MenuItemType } from "@kysion/types";

export class Menu {
    public static createMenu(data: MenuItemType) {
        return http.post<MenuItemType>('/menu/createMenu', data);
    }

    public static deleteMenu(data: { id: string | number }) {
        return http.post<boolean>('/menu/deleteMenu', data);
    }

    public static getMenuById(data: { id: string | number }) {
        return http.post<MenuItemType>('/menu/getMenuById', data);
    }

    public static getMenuTree(data: { id: string | number }) {
        return http.post<MenuItemType[]>('/menu/getMenuTree', data);
    }

    public static updateMenu(data: MenuItemType) {
        return http.post<MenuItemType>('/menu/updateMenu', data);
    }
} 