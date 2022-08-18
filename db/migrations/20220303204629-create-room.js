export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Rooms', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      alias: {
        allowNull: false,
        type: Sequelize.STRING
      },
      desc: {
        allowNull: true,
        type: Sequelize.STRING
      },
      roomId: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      roomName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      eventId: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'Events',
          key: 'id',
        }
      },
      maxCapacity: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      userId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Rooms');
  }
};
