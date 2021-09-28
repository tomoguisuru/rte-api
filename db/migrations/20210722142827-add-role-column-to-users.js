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
      'role',
      {
        type: Sequelize.STRING,
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
      'role',
      {transaction}
    );

    await transaction.commit();
  }
};
