'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('format-channel', [
      {
        value: '1/24',
      },
      {
        value: '2/48',
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('format-channel', null, {});
  },
};
