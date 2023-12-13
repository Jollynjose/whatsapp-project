import { MenuWithOptionsAndAnswer } from '../../types/tMenu';
import { $Enums } from '@prisma/client';

type action = 'OPTION' | 'ANSWER';
class MenuHelper {
  public type: $Enums.BotMenuType;
  private menus: MenuWithOptionsAndAnswer[];
  private currentMenu!: MenuWithOptionsAndAnswer;
  private orderOption: number = 0;
  private action: action = 'OPTION';

  constructor(type: $Enums.BotMenuType, menus: MenuWithOptionsAndAnswer[]) {
    this.type = type;
    this.menus = menus;

    const menu = this.menus.find((menu) => menu.type === type);
    if (menu) this.currentMenu = menu;
  }

  getCurrentMenu() {
    return this.currentMenu;
  }

  getOrderOption() {
    return this.orderOption;
  }

  setAction(action: action) {
    this.action = action;
  }

  getAction() {
    return this.action;
  }

  getOption() {
    const option = this.currentMenu.options.find(
      (option) => option.order === this.orderOption,
    );
    if (option) {
      return option;
    }
    return null;
  }

  setOrderOption(order: number) {
    this.orderOption = order;
  }

  getOptionByOrder(order: number) {
    const option = this.currentMenu.options.find(
      (option) => option.order === order,
    );
    if (option) {
      this.orderOption = order;
      return option;
    }
    return null;
  }

  setCurrentMenu(type: $Enums.BotMenuType) {
    this.type = type;
    const menu = this.menus.find((menu) => menu.type === type);
    if (menu) {
      this.currentMenu = menu;
      this.orderOption = 0;
      this.action = 'OPTION';
    }
  }

  isOptionExist(orderOption: number, type: $Enums.BotMenuType) {
    const menu = this.menus.find((menu) => menu.type === type);
    if (menu) {
      const option = menu.options.find(
        (option) => option.order === orderOption,
      );
      if (
        option ||
        (type === $Enums.BotMenuType.MAIN &&
          orderOption === menu.options.length + 1)
      ) {
        return true;
      }
    }
    return false;
  }

  updateMenu(menus: MenuWithOptionsAndAnswer[]) {
    this.menus = menus;
    const menu = this.menus.find((menu) => menu.type === this.type);
    if (menu) {
      this.currentMenu = menu;
    }
  }
}

export default MenuHelper;
