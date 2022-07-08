import { v4 as uuidv4 } from 'uuid';

export default {
  up: async (queryInterface, Sequelize) => {

    // password: "password",
    const hash = '$argon2i$v=19$m=4096,t=3,p=1$mJo5JpQwop9ryR9glBtrpigy6ZRYRbTl5PyuNM3djjs$8ZciAHW96315C3dDEIuG1ktguAS5sDIK4xKKy1oSj7A';
    const salt = '989a39269430a29f6bc91f60941b6ba62832e9945845b4e5e4fcae34cddd8e3b';

    await queryInterface.bulkInsert('Users', [
      {
        hash,
        salt,
        id: uuidv4(),
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'admin',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        hash,
        salt,
        id: uuidv4(),
        firstName: 'Bob',
        lastName: 'Ross',
        email: 'bob.ross@example.com',
        role: 'publisher',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
