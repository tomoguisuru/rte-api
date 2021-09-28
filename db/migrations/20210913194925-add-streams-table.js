export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Streams', {
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
      channelId: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      channelName: {
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
      quality: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Streams');
  }
};
