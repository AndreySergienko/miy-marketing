'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('status', [
      {
        value: 'CREATE',
        description: 'Создан',
      },
      {
        value: 'AWAIT',
        description: 'Ожидает действий со стороны модераторов',
      },
      {
        value: 'PUBLIC',
        description: 'Опубликован готов для пользователя',
      },
      {
        value: 'FINISH',
        description: 'Сделка завершена',
      },
      {
        value: 'CANCEL',
        description: 'Сделка отменена',
      },
      {
        value: 'PROCESS',
        description: 'Участвует в сделке',
      },
      {
        value: 'PAID',
        description: 'Оплачено',
      },
      {
        value: 'MODERATE',
        description: 'Проверка сообщения',
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('status', null, {});
  },
};
