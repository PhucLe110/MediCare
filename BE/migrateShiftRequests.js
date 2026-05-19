const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI + process.env.DATABASE_NAME).then(async () => {
  const col = mongoose.connection.collection('shiftrequests');
  const all = await col.find({}).toArray();
  console.log('Total shift requests:', all.length);
  
  let migrated = 0;
  for (const doc of all) {
    const hasTimes = Array.isArray(doc.times) && doc.times.length > 0;
    const hasTime = doc.time && typeof doc.time === 'string';
    
    if (hasTime && !hasTimes) {
      await col.updateOne(
        { _id: doc._id },
        { $set: { times: [doc.time] }, $unset: { time: '' } }
      );
      console.log('Migrated:', doc._id, '| time:', doc.time, '->', [doc.time]);
      migrated++;
    } else if (!hasTimes && !hasTime) {
      console.log('Orphan (no time/times):', doc._id, '| status:', doc.status, '| date:', doc.date);
    }
  }
  
  console.log('\nMigration done. Migrated:', migrated);
  mongoose.disconnect();
}).catch(e => { console.error(e); process.exit(1); });
