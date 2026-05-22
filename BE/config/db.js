const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = `${process.env.MONGODB_URI}${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
    const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/medicare');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Run database migrations
    const { migrateMedicineExpiry } = require('../utils/dbMigration');
    await migrateMedicineExpiry();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
