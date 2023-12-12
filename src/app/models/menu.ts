import { MenuWithOptionsAndAnswer } from '../../types/tMenu';
import { $Enums } from '@prisma/client';

class MenuHelper {
  public type: $Enums.BotMenuType;
  private menus: MenuWithOptionsAndAnswer[];
  private currentMenu!: MenuWithOptionsAndAnswer;

  constructor(type: $Enums.BotMenuType, menus: MenuWithOptionsAndAnswer[]) {
    this.type = type;
    this.menus = menus;

    const menu = this.menus.find((menu) => menu.type === type);
    if (menu) this.currentMenu = menu;
  }

  getCurrentMenu() {
    return this.currentMenu;
  }

  setCurrentMenu(type: $Enums.BotMenuType) {
    this.type = type;
    const menu = this.menus.find((menu) => menu.type === type);
    if (menu) this.currentMenu = menu;
  }
}

export default MenuHelper;
