export default {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    const [eventStreams] = await queryInterface.sequelize.query('SELECT * FROM public."EventStreams"');

    for (let record of eventStreams) {
      await queryInterface.sequelize.query(`
          UPDATE public."Streams"
          SET "userId" = :userId
          WHERE id = :streamId
        `,
        {
          replacements: record,
        },
        { transaction },
      );
    }

    await transaction.commit();
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    queryInterface.bulkUpdate('Streams', { streamId: null });

    await transaction.commit();
  }
};
