'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.addColumn(
      'Events',
      'deletedAt',
      {
        allowNull: true,
        type: Sequelize.DATE,
      },
      {transaction}
    );

    await transaction.commit();
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.removeColumn(
      'Events',
      'deletedAt',
      {transaction}
    );

    await transaction.commit();
  }
};
