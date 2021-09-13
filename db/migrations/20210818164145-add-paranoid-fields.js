/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 * @typedef {import('sequelize').QueryInterface} QueryInterface
 */

export default {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.addColumn(
      'Users',
      'deletedAt',
      {
        allowNull: true,
        type: Sequelize.DATE,
      },
      {transaction}
    );

    await queryInterface.addColumn(
      'EventStreams',
      'deletedAt',
      {
        allowNull: true,
        type: Sequelize.DATE,
      },
      {transaction}
    );

    await transaction.commit();
  },


  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   * @returns
   */
  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.removeColumn(
      'Users',
      'deletedAt',
      {transaction}
    );

    await queryInterface.removeColumn(
      'EventStreams',
      'deletedAt',
      {transaction}
    );

    await transaction.commit();
  }
};
