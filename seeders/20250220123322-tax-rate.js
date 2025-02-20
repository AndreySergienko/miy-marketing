'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('tax_rate', [
      {
        id: 1,
        value: '6%',
      },
      {
        id: 2,
        value: '15%',
      },
      {
        id: 3,
        value: 'ОСНО',
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('tax_rate', null, {});
  },
};
