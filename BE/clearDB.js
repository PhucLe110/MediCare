const mongoose = require('mongoose');
require('dotenv').config();

const clearData = async () => {
  try {
    const uri = `${process.env.MONGODB_URI}${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
    console.log('Connecting to database to clear data...');
    await mongoose.connect(uri);
    
    console.log('Connected. Dropping database HospitalStateMent...');
    await mongoose.connection.db.dropDatabase();
    
    console.log('Database successfully cleared!');
    process.exit();
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearData();
