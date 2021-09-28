export default {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.addColumn(
      'Streams',
      'userId',
      {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      {transaction}
    );

    await transaction.commit();
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.removeColumn(
      'Streams',
      'userId',
      {transaction}
    );

    await transaction.commit();
  }
};
