export default {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.dropTable('EventStreams', { transaction });

    await transaction.commit();
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    await queryInterface.createTable(
      'EventStreams',
      {
        id: {
          allowNull: false,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          type: Sequelize.UUID,
        },
        eventId: {
          type: Sequelize.STRING,
          references: {
            model: 'Events',
            key: 'id'
          },
        },
        streamId: {
          type: Sequelize.STRING,
          references: {
            model: 'Streams',
            key: 'id'
          },
        },
        userId: {
          type: Sequelize.UUID,
          references: {
            model: 'Users',
            key: 'id'
          },
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deletedAt: {
          allowNull: true,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      },
      { transaction }
    );

    const [eventStreams] = await queryInterface.sequelize.query(
      'SELECT * FROM public."Streams" WHERE "userId" IS NOT NULL'
    );

    for (let record of eventStreams) {
      await queryInterface.sequelize.query(`
          INSERT INTO public."EventStreams"(id, "eventId", "streamId", "userId", "createdAt", "updatedAt")
          VALUES (:id, :eventId, :id, :userId, :updatedAt, :updatedAt)
        `,
        {
          replacements: record,
        },
        { transaction },
      );
    }

    await transaction.commit();
  }
};
