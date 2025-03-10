export class StatusStore {
  static get CREATE() {
    return 1;
  }

  static get AWAIT() {
    return 2;
  }

  static get PUBLIC() {
    return 3;
  }

  static get FINISH() {
    return 4;
  }

  static get CANCEL() {
    return 5;
  }

  static get PROCESS() {
    return 6;
  }

  static get PAID() {
    return 7;
  }

  static get MODERATE_MESSAGE() {
    return 8;
  }
}
