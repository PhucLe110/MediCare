require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const Bill = require('./models/Bill');

async function fixData() {
  const uri = process.env.MONGODB_URI ? `${process.env.MONGODB_URI}${process.env.DATABASE_NAME}?retryWrites=true&w=majority` : 'mongodb://localhost:27017/medicare';
  await mongoose.connect(uri);
  
  const paidBills = await Bill.find({ status: 'paid' });
  let count = 0;
  for (const b of paidBills) {
    if (b.appointment) {
      const appt = await Appointment.findById(b.appointment);
      if (appt && appt.paymentStatus !== 'paid') {
        appt.paymentStatus = 'paid';
        await appt.save();
        count++;
      }
    }
  }
  console.log(`Fixed ${count} appointments to match paid bills.`);
  process.exit(0);
}

fixData();
