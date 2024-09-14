const mongoose = require('mongoose');

const ConnecionDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Remove deprecated options
    });

    console.log('Database Connection Successful');
  } catch (error) {
    console.error('Database Connection Error:', error.message);
    console.error(error.stack);
  }
};

module.exports = ConnecionDb;
