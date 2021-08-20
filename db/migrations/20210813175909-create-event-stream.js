export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EventStreams', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
      },
      eventId: {
        type: Sequelize.STRING
      },
      ownerId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
      },
      streamId: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('EventStreams');
  }
};