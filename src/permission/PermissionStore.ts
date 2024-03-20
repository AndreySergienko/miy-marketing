export default class PermissionStore {
  static get validateUserPermissions() {
    return [2, 6];
  }

  static get adminRoles() {
    // TODO временно 6
    return 6;
  }
}
