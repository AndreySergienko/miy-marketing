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

  // // Канал зарегистрирован и проходит модерацию
  // static get CHANNEL_REGISTERED() {
  //   return 1;
  // }
  //
  // // Регистрация канала или сообщения была отменена
  // static get CANCELED() {
  //   return 2;
  // }
  //
  // // Канал опубликован, слоты имеют статус свободный
  // static get PUBLICATION() {
  //   return 3;
  // }
  //
  // // Завершён
  // static get FINISHED() {
  //   return 4;
  // }
  //
  // // Активный слот
  // static get ACTIVE() {
  //   return 5;
  // }
  //
  // // Не активный слот
  // static get DE_ACTIVE() {
  //   return 6;
  // }
  //
  // // Статус свободного слота
  // static get FREE() {
  //   return 7;
  // }
  //
  // // Статус в ожидании - применимо для слотов
  // static get AWAIT() {
  //   return 8;
  // }
}
