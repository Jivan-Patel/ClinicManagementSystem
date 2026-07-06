const mongoose = require('mongoose');

beforeAll(async () => {
  const mongoUri = 'mongodb://localhost:27017/cms_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});
