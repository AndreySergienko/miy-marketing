export default class PermissionStore {
  static get CAN_BUY() {
    return 1;
  }

  static get CAN_PUBLIC_CHANNEL() {
    return 2;
  }

  static get CAN_SEND_VALID_MESSAGE() {
    return 3;
  }

  static get CAN_BAN() {
    return 4;
  }

  static get CAN_PARDON() {
    return 5;
  }

  static get CAN_USER_UPDATE() {
    return 6;
  }

  static get CAN_VALIDATE() {
    return 7;
  }

  static get CAN_CHECK_CHANNEL() {
    return 8;
  }

  static get USER_PERMISSIONS() {
    return [
      PermissionStore.CAN_BUY,
      PermissionStore.CAN_PUBLIC_CHANNEL,
      PermissionStore.CAN_SEND_VALID_MESSAGE,
      PermissionStore.CAN_USER_UPDATE,
      PermissionStore.CAN_CHECK_CHANNEL,
    ];
  }

  static get ADMIN_PERMISSIONS() {
    return [
      ...PermissionStore.USER_PERMISSIONS,
      PermissionStore.CAN_BAN,
      PermissionStore.CAN_PARDON,
      PermissionStore.CAN_VALIDATE,
    ];
  }
}
