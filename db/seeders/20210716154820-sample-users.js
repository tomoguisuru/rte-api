import { v4 as uuidv4 } from 'uuid';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      // password: "password",
      id: uuidv4(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      hash: '$argon2i$v=19$m=4096,t=3,p=1$mJo5JpQwop9ryR9glBtrpigy6ZRYRbTl5PyuNM3djjs$8ZciAHW96315C3dDEIuG1ktguAS5sDIK4xKKy1oSj7A',
      salt: '989a39269430a29f6bc91f60941b6ba62832e9945845b4e5e4fcae34cddd8e3b',
      role: 'super-admin',
      updatedAt: new Date(),
      createdAt: new Date()
     }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};