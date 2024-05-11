'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('permission', [
      {
        value: 'CAN_BUY',
        description: 'Покупка рекламы',
      },
      {
        value: 'CAN_PUBLIC_CHANNEL',
        description: 'Публикация канала',
      },
      {
        value: 'CAN_SEND_VALID_MESSAGE',
        description: 'Отправить на валидацию сообщения',
      },
      {
        value: 'CAN_BAN',
        description: 'Возможность блокировать',
      },
      {
        value: 'CAN_PARDON',
        description: 'Возможность разблокировать',
      },
      {
        value: 'CAN_USER_UPDATE',
        description: 'Обновить данные о пользователе',
      },
      {
        value: 'CAN_VALIDATE',
        description: 'Валидировать любые данные',
      },
      {
        value: 'CAN_CHECK_CHANNEL',
        description: 'Проверять канал на регистрации',
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('permission', null, {});
  },
};
