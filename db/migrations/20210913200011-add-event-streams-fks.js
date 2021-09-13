'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.changeColumn(
      'EventStreams',
      'eventId',
      {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'Events',
          key: 'id'
        },
      },
      {transaction}
    );

    await queryInterface.changeColumn(
      'EventStreams',
      'streamId',
      {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'Streams',
          key: 'id'
        },
      },
      {transaction}
    );

    await transaction.commit();
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.changeColumn(
      'EventStreams',
      'eventId',
      {
        allowNull: false,
        type: Sequelize.STRING,
      },
      {transaction}
    );

    await queryInterface.changeColumn(
      'EventStreams',
      'streamId',
      {
        allowNull: false,
        type: Sequelize.STRING,
      },
      {transaction}
    );

    await transaction.commit();
  }
};
