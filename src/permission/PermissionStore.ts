export default class PermissionStore {
  static get validateUserPermissions() {
    return [2, 6];
  }

  static get adminRoles() {
    return [7];
  }
}
